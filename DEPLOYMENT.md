# Deployment Guide

This guide covers deploying PGLife to production using Vercel, with PostgreSQL on Supabase.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] **Vercel account** - Sign up at [vercel.com](https://vercel.com)
- [x] **Supabase project** - Database hosting
- [x] **Third-party API keys** - Razorpay, Cloudinary, Resend, Upstash, Turnstile
- [x] **GitHub repository** - Code hosted on GitHub
- [x] **All tests passing** - Run `npm test` and `npm run test:e2e`

---

## Environment Setup

### 1. Create Production Environment Variables

Create these environment variables in your Vercel project dashboard:

#### Database (Supabase)

```env
DATABASE_URL="postgresql://user:pass@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@db.xxx.supabase.co:5432/postgres"
```

**Important:** Use session pooler URL for `DATABASE_URL` (with `?pgbouncer=true`)

#### Authentication

```env
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
```

#### Payment Integration

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

**Note:** Use `rzp_live_` keys for production (not `rzp_test_`)

#### Image Storage

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Email Service

```env
RESEND_API_KEY="re_xxxxxxxx"
```

#### CAPTCHA

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4xxxxxxxxxxx"
TURNSTILE_SECRET_KEY="0x4xxxxxxxxxxx"
```

#### Rate Limiting

```env
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

#### Error Tracking (Optional)

```env
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Alternative (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users (e.g., Mumbai for India)
3. Set a strong database password
4. Wait for provisioning (~2 minutes)

### 2. Get Connection Strings

From Supabase dashboard → Settings → Database:

- **Session pooler (Transaction mode)** → Use for `DATABASE_URL`
- **Direct connection** → Use for `DIRECT_URL`

### 3. Push Database Schema

```bash
# From local machine, with production DATABASE_URL in .env
npx prisma db push

# Verify schema was created
npx prisma studio
```

### 4. Seed Initial Data (Optional)

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@pglife.in` / `Admin@2026`
- Test tenant: `tenant1@pglife.in` / `Tenant@2026`
- Test owner: `owner1@pglife.in` / `Owner@2026`
- 7 sample properties across 5 cities

**Important:** Change admin password after first login!

---

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

#### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select "Next.js" as framework preset
4. Click "Deploy"

#### 2. Configure Project

**Build Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Environment Variables:**
- Add all production environment variables from [Environment Setup](#environment-setup)
- Copy from `.env.production.example` if available

#### 3. Deploy

Click **"Deploy"** and wait for build to complete (~2-3 minutes)

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to set environment variables
```

### Automatic Deployments

**Configured in `.github/workflows/deploy.yml`:**

- **Push to `main`** → Production deployment
- **Pull requests** → Preview deployments
- **Push to other branches** → Preview deployments

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check build logs in Vercel dashboard
# Visit your production URL

# Test critical flows:
curl https://your-domain.vercel.app/api/health  # Health check
```

### 2. Test Key Functionality

Manual testing checklist:

- [ ] Homepage loads correctly
- [ ] User can sign up (with CAPTCHA)
- [ ] User can log in
- [ ] Property search works
- [ ] Property details page loads
- [ ] Image uploads work (Cloudinary)
- [ ] Token booking works (Razorpay)
- [ ] Email notifications sent (Resend)
- [ ] Admin panel accessible
- [ ] Rate limiting works (try rapid requests)

### 3. Configure Custom Domain (Optional)

In Vercel dashboard → Settings → Domains:

1. Add your custom domain (e.g., `pglife.in`)
2. Update DNS records with your domain provider
3. Vercel automatically provisions SSL certificate
4. Update `NEXTAUTH_URL` environment variable to custom domain
5. Redeploy for changes to take effect

### 4. Enable Analytics

**Vercel Analytics** (already integrated):
- Go to Vercel dashboard → Analytics tab
- View real-time metrics

**Sentry Error Tracking**:
- Visit [sentry.io](https://sentry.io)
- Check error reports
- Set up alert rules

---

## Rollback Procedures

### Rollback to Previous Deployment

**Via Vercel Dashboard:**

1. Go to Deployments tab
2. Find previous successful deployment
3. Click three dots → "Promote to Production"
4. Confirm rollback

**Via Vercel CLI:**

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Rollback Database Changes

**If schema change causes issues:**

```bash
# Connect to database
psql $DATABASE_URL

# Manually revert schema changes
# Or restore from Supabase backup:
```

**In Supabase Dashboard:**
- Database → Backups
- Select backup to restore
- Confirm restoration

---

## Troubleshooting

### Build Failures

**Error:** `Prisma Client not generated`

```bash
# Solution: Prisma generate runs automatically in build script
# Verify package.json has: "build": "prisma generate && next build"
```

**Error:** `Module not found` errors

```bash
# Solution: Clear build cache
vercel --prod --force
```

### Runtime Errors

**Error:** `Database connection failed`

```bash
# Check:
# 1. DATABASE_URL is correct
# 2. Supabase database is not paused
# 3. Connection pooler is enabled
# 4. IP allowlist includes Vercel IPs (or set to allow all)
```

**Error:** `Rate limit exceeded immediately`

```bash
# Check:
# 1. UPSTASH_REDIS_REST_URL is correct
# 2. UPSTASH_REDIS_REST_TOKEN is valid
# 3. Redis database is not full
```

**Error:** `Razorpay signature verification failed`

```bash
# Check:
# 1. Using correct RAZORPAY_KEY_SECRET (live key)
# 2. Webhook secret matches Razorpay dashboard
```

### Performance Issues

**Slow API responses:**

```bash
# Check:
# 1. Database indexes are created (see prisma/schema.prisma)
# 2. Connection pooler is enabled
# 3. Vercel region matches database region
```

**High memory usage:**

```bash
# Check:
# 1. Next.js Image Optimization is not disabled
# 2. No memory leaks in API routes
# 3. Prisma Client is properly instantiated (singleton pattern)
```

### SSL Certificate Issues

**"Site can't provide a secure connection"**

```bash
# Wait 24-48 hours for DNS propagation
# Verify DNS records are correct
# Contact Vercel support if persists
```

---

## Production Checklist

Before going live, verify:

### Security

- [ ] All environment variables use production values
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] API keys are production keys (not test/sandbox)
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Rate limiting is enabled

### Functionality

- [ ] All critical user flows tested
- [ ] Payment integration tested with live keys
- [ ] Email notifications working
- [ ] Image uploads working
- [ ] Admin panel accessible
- [ ] Database seeded with initial data

### Monitoring

- [ ] Sentry configured and receiving events
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error alerting configured
- [ ] Uptime monitoring set up (optional)

### Documentation

- [ ] README updated with production URL
- [ ] API documentation current
- [ ] Runbook available for on-call
- [ ] Rollback procedures documented

---

## Production URLs

After deployment, your URLs will be:

- **Application:** `https://your-project.vercel.app`
- **API Endpoints:** `https://your-project.vercel.app/api/*`
- **Admin Panel:** `https://your-project.vercel.app/admin`

---

## Support

**Deployment Issues:**
- Vercel Dashboard → Help → Contact Support
- [Vercel Documentation](https://vercel.com/docs)

**Database Issues:**
- Supabase Dashboard → Support
- [Supabase Documentation](https://supabase.com/docs)

**Application Issues:**
- Check Sentry error logs
- Review Vercel function logs
- Open GitHub issue

---

**Need help?** Open an issue on [GitHub](https://github.com/cod-x-prince/pg-app/issues)

**Last Updated:** 2026-03-30
