<div align="center">

```
██████╗  ██████╗ ██╗     ██╗███████╗███████╗
██╔══██╗██╔════╝ ██║     ██║██╔════╝██╔════╝
██████╔╝██║  ███╗██║     ██║█████╗  █████╗
██╔═══╝ ██║   ██║██║     ██║██╔══╝  ██╔══╝
██║     ╚██████╔╝███████╗██║██║     ███████╗
╚═╝      ╚═════╝ ╚══════╝╚═╝╚═╝     ╚══════╝
```

### India's trusted PG booking marketplace

_Verified listings · Zero broker fees · Direct booking_

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)

**[Live Demo](https://pg-app-i1h8.vercel.app)** · **[Report Bug](https://github.com/cod-x-prince/pg-app/issues)** · **[Request Feature](https://github.com/cod-x-prince/pg-app/issues)**

</div>

---

## What is PGLife?

PGLife is a two-sided marketplace for Paying Guest (PG) accommodation in India. Owners list verified PGs, tenants discover and book them — with token payments, WhatsApp integration, and a trust-first experience built natively for the Indian rental market.

**The problem:** Finding a trustworthy PG in Indian cities is fragmented, opaque, and dominated by brokers charging 1–2 months rent. Most listings are fake, photos are recycled, and there is zero accountability.

**The solution:** Verified listings with real photos, direct owner contact via WhatsApp, ₹500 token booking to hold rooms, and a review system that only allows verified tenants to write reviews.

---

## Tech Stack

| Layer            | Technology                   | Notes                            |
| ---------------- | ---------------------------- | -------------------------------- |
| Framework        | Next.js 14.2.35 (App Router) | Force-dynamic API routes         |
| Language         | TypeScript 5 (strict)        | Central types in `@/types`       |
| Styling          | Tailwind CSS + CSS Variables | Terracotta Earth design system   |
| Database         | PostgreSQL via Supabase      | Session pooler for Vercel        |
| ORM              | Prisma 5.22                  | CUID IDs, 12 indexes, 9 models   |
| Auth             | NextAuth.js v4               | JWT + credentials + Google OAuth |
| Images           | Cloudinary                   | AVIF/WebP auto-optimization      |
| Payments         | Razorpay                     | ₹500 token booking flow          |
| Email            | Resend                       | 4 transactional templates        |
| Rate Limiting    | Upstash Redis                | Persistent across cold starts    |
| Error Monitoring | Sentry                       | Client + server + edge           |
| Analytics        | Vercel Analytics             | Anonymous page views             |
| CAPTCHA          | Cloudflare Turnstile         | Managed, invisible for humans    |
| Deployment       | Vercel                       | Edge network, auto-deploy        |

---

## Features

### For Tenants

- City-based search with autocomplete and keyboard navigation
- Filter by gender, rent range, amenities, food plan
- Property galleries with lightbox
- House rules displayed before booking
- WhatsApp direct contact with pre-filled messages
- Token booking (₹500 via Razorpay) to hold a room instantly
- Verified reviews — only tenants with confirmed bookings can review
- Sticky mobile booking bar — Reserve + WhatsApp always visible

### For Owners

- 6-step listing wizard — basic info, rooms & house rules, food plan & neighbourhood, photos, amenities, preview
- Cloudinary image upload — sequential, crash-safe, client-side compressed
- Owner dashboard — booking requests, confirm/decline, delete listings
- Email notifications via Resend — new bookings + approval alerts

### For Platform

- Admin panel — approve owners, verify/delist properties
- Role-based access control — TENANT / OWNER / BROKER / ADMIN
- Rate limiting on all sensitive endpoints
- Health check script covering 38 routes

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **Supabase account** (free) — [supabase.com](https://supabase.com)
- **Cloudinary account** (free) — [cloudinary.com](https://cloudinary.com)
- **Vercel account** (free) — [vercel.com](https://vercel.com)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/cod-x-prince/pg-app.git
cd pg-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env` — see the [Environment Variables](#environment-variables) section below.

### 3. Set up the database

```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Set your account as admin

Supabase → Table Editor → `User` → your row → set `role = ADMIN`, `isApproved = true`

---

## Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**.
For local dev, add them to your `.env` file.

> **Important:** In Vercel UI, paste raw values **without quotes**. Quotes are only for `.env` files.

### Required — App won't start without these

```env
# Database (Supabase)
# Get from: supabase.com → Project Settings → Database → Connection string
DATABASE_URL="postgresql://postgres.REF:PASS@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&prepare=false"
DIRECT_URL="postgresql://postgres.REF:PASS@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Authentication
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="https://your-app.vercel.app"  # http://localhost:3000 for local dev

# Cloudinary (images)
# Get from: cloudinary.com → Dashboard (shown at top)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"  # same as CLOUDINARY_CLOUD_NAME
```

### Optional — Features activate when added

```env
# Razorpay (payments)
# Get from: razorpay.com → Settings → API Keys → Generate Test Key
# NEXT_PUBLIC key is the SAME value as KEY_ID
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"

# Resend (email)
# Get from: resend.com → API Keys → Create API Key
# Use onboarding@resend.dev until you have a verified domain
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Google OAuth (sign in with Google)
# Get from: console.cloud.google.com → Credentials → OAuth 2.0 Client IDs
# Add redirect URI: https://your-app.vercel.app/api/auth/callback/google
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"

# Cloudflare Turnstile (CAPTCHA)
# Get from: dash.cloudflare.com → Turnstile → your widget
# Paste raw values without quotes in Vercel
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAxxxxxxxxxxx"
TURNSTILE_SECRET_KEY="0x4AAAAAAAxxxxxxxxxxx"

# Sentry (error monitoring)
# Get from: sentry.io → Project Settings → Client Keys (DSN)
SENTRY_DSN="https://xxx@oyyy.ingest.sentry.io/zzz"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@oyyy.ingest.sentry.io/zzz"
SENTRY_AUTH_TOKEN="sntrys_your_auth_token"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="pglife"

# Upstash Redis (rate limiting)
# Get from: upstash.com → Redis database → REST API
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"
```

---

## Third-Party Services Setup

### Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose region closest to your users (ap-south-1 for India)
3. Project Settings → Database → Connection string
4. Copy **Transaction pooler** URL (port 6543) → `DATABASE_URL` (add `?pgbouncer=true&connection_limit=1&prepare=false`)
5. Copy **Session pooler** URL (port 5432) → `DIRECT_URL`

### Cloudinary (Images)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard shows **Cloud Name**, **API Key**, **API Secret** at the top
3. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = same value as `CLOUDINARY_CLOUD_NAME`

### Razorpay (Payments)

1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Settings → API Keys → Generate Test Key
3. `NEXT_PUBLIC_RAZORPAY_KEY_ID` = same value as `RAZORPAY_KEY_ID`
4. Complete KYC before switching to live keys (`rzp_live_` prefix)

### Resend (Email)

1. Go to [resend.com](https://resend.com) → Sign up free
2. API Keys → Create API Key → name it `pglife`
3. Use `onboarding@resend.dev` as FROM until you verify your domain
4. After buying a domain → Resend → Domains → verify → change to `noreply@yourdomain.com`

### Cloudflare Turnstile (CAPTCHA)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile
2. Add site → name: PGLife | domain: your-app.vercel.app | type: Managed
3. Copy **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Copy **Secret Key** → `TURNSTILE_SECRET_KEY`
5. In Vercel: paste raw values **without quotes**

### Google OAuth (Sign in with Google)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → New Project → PGLife
2. APIs & Services → OAuth consent screen → External → fill app name
3. Credentials → Create Credentials → OAuth Client ID → Web application
4. Authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### Upstash Redis (Rate Limiting)

1. Go to [upstash.com](https://upstash.com) → Create Database
2. Region: ap-south-1 (India)
3. REST API section → copy URL and Token

---

## Test Accounts (after seeding)

| Email               | Password       | Role             | Notes                           |
| ------------------- | -------------- | ---------------- | ------------------------------- |
| `admin@pglife.in`   | `Admin@2026`   | Admin            | Approve owners, verify listings |
| `owner1@pglife.in`  | `Owner@2026`   | Owner (approved) | Create listings, view bookings  |
| `tenant1@pglife.in` | `Tenant@2026`  | Tenant           | Browse, book, write reviews     |
| `pending@pglife.in` | `Pending@2026` | Owner (pending)  | Shows unapproved state          |

---

## Project Structure

```
pg-app/
├── src/
│   ├── app/
│   │   ├── (public)/           # Homepage, listings, property detail
│   │   ├── (auth)/             # Dashboards, admin, listing wizard
│   │   ├── api/                # 23 REST API routes (all force-dynamic)
│   │   │   ├── auth/           # NextAuth + signup (Turnstile protected)
│   │   │   ├── properties/     # CRUD + rooms/images/amenities/like
│   │   │   ├── bookings/       # Tenant bookings + owner management
│   │   │   ├── payments/       # Razorpay create-order + verify
│   │   │   ├── email/          # Resend transactional triggers
│   │   │   └── admin/          # Owner approval + property verification
│   │   ├── privacy/            # DPDP Act 2023 compliant
│   │   └── terms/              # 12-section ToS, Indian law
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── properties/         # PropertyCard, FilterPanel, GalleryClient
│   │   ├── booking/            # BookingForm (Razorpay + WhatsApp)
│   │   ├── home/               # HeroSearch (command palette)
│   │   └── ui/                 # PageLoader, TurnstileWidget
│   ├── lib/
│   │   ├── auth.ts             # NextAuth + Google OAuth + rate limit
│   │   ├── email.ts            # Resend service (4 templates)
│   │   ├── handler.ts          # withHandler() global error wrapper
│   │   ├── rateLimit.ts        # Upstash Redis sliding window
│   │   ├── schemas.ts          # Zod validation (all API routes)
│   │   ├── turnstile.ts        # Cloudflare verification (fail-open)
│   │   └── prisma.ts           # Singleton with connection pooling
│   └── types/
│       └── index.ts            # SessionUser, PropertyListItem, Booking, etc.
├── prisma/
│   ├── schema.prisma           # 9 models, 12 indexes, cuid IDs
│   └── seed.ts                 # 4 users, 7 properties, reviews
├── scripts/
│   └── health-check.ts         # Tests all 38 API routes
└── public/
    └── og-image.svg            # 1200×630 Open Graph image
```

---

## Scripts

```bash
npm run dev                                          # Start dev server at localhost:3000
npm run build                                        # Production build
npm run start                                        # Start production server locally
npx tsc --noEmit                                     # TypeScript check without compiling
npx prisma db push                                   # Push schema to database (safe)
npx prisma generate                                  # Regenerate Prisma client
npx prisma studio                                    # Database GUI at localhost:5555
npx tsx prisma/seed.ts                               # Seed test data
npx tsx scripts/health-check.ts https://your-url    # Test all 38 routes
npx vercel --prod --force                            # Force deploy to production
npm audit                                            # Check for vulnerabilities
npm audit fix                                        # Fix non-breaking vulnerabilities
```

---

## Deployment

### First time

1. Push to GitHub
2. [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: Next.js (auto-detected)
4. Add all environment variables
5. Deploy

### After that — auto-deploys on every push to `main`

Or manually:

```bash
git add .
git commit -m "your message"
git push origin main
```

> **Important:** `DATABASE_URL` must end with `?pgbouncer=true&connection_limit=1&prepare=false`

---

## Security

| Protection       | Implementation                                        |
| ---------------- | ----------------------------------------------------- |
| SQL Injection    | Prisma parameterized queries — zero raw SQL           |
| XSS              | CSP headers + React auto-escaping                     |
| Password storage | bcrypt cost factor 12                                 |
| Brute force      | Upstash Redis rate limiting (10 login attempts/15min) |
| Bot signups      | Cloudflare Turnstile CAPTCHA                          |
| CSRF             | NextAuth built-in CSRF protection                     |
| File uploads     | Type whitelist + size limits + user-isolated folders  |
| Sessions         | HTTP-only cookies, JWT, 24hr expiry                   |
| Headers          | CSP, HSTS, X-Frame-Options, X-Content-Type-Options    |
| Payment          | Razorpay signatures verified server-side              |

---

## Roadmap

- [x] Core marketplace — listings, search, filter, booking
- [x] Auth — credentials + Google OAuth
- [x] Owner dashboard + 6-step listing wizard
- [x] Admin panel — owner approval, property verification
- [x] Razorpay token booking (₹500)
- [x] Resend transactional emails (4 templates)
- [x] Cloudflare Turnstile CAPTCHA
- [x] House rules + Food plan + Neighbourhood fields
- [x] Airbnb-style UI — clean white, mobile booking bar
- [x] Privacy Policy + Terms of Service (DPDP Act 2023)
- [ ] User profile page with avatar upload
- [ ] Date availability filter on listings
- [ ] Commission model + Owner premium plan (₹499/month)
- [ ] WhatsApp notifications for owners (Twilio)
- [ ] Google Maps on property detail page
- [ ] SEO + sitemap + structured data
- [ ] pglife.in domain + professional email
- [ ] E2E test suite (Playwright)
- [ ] Mobile app (React Native)

---

## Cities

Bangalore · Mumbai · Delhi · Hyderabad · Pune · Chennai · Kolkata · Jammu · Srinagar

---

## Contributing

This is a private startup. Security vulnerabilities should be reported privately to **prince@pglife.in** — not as public issues.

---

## License

Private — all rights reserved. © 2026 PGLife.

---

<div align="center">

Built with obsession in India by **Prince Jamwal** & **Paras Jamwal**

_"Your perfect home awaits."_

</div>
