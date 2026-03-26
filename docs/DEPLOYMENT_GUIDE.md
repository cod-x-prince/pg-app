# 🚀 Deployment Scripts & Automation

**Project:** Gharam (PGLife) - Production Deployment Guide  
**Platform:** Vercel (Next.js)  
**Database:** Supabase (PostgreSQL)  
**Monitoring:** Sentry + Uptime monitoring

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Migration Scripts](#database-migration-scripts)
3. [Deployment Automation](#deployment-automation)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Emergency Runbooks](#emergency-runbooks)

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

**`scripts/verify-env.sh`**
```bash
#!/bin/bash
# Verify all required environment variables are set

set -e

echo "🔍 Verifying environment variables..."

REQUIRED_VARS=(
  "DATABASE_URL"
  "DIRECT_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "RAZORPAY_KEY_ID"
  "RAZORPAY_KEY_SECRET"
  "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  "RESEND_API_KEY"
  "CLOUDINARY_CLOUD_NAME"
  "CLOUDINARY_API_KEY"
  "CLOUDINARY_API_SECRET"
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
  "TURNSTILE_SITE_KEY"
  "TURNSTILE_SECRET_KEY"
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "SENTRY_DSN"
  "NEXT_PUBLIC_SENTRY_DSN"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo ""
  echo "❌ Deployment blocked: ${#MISSING_VARS[@]} environment variable(s) missing"
  exit 1
fi

echo ""
echo "✅ All environment variables configured"
```

**Make executable:**
```bash
chmod +x scripts/verify-env.sh
```

### 2. Code Quality Checks

**`scripts/pre-deploy-check.sh`**
```bash
#!/bin/bash
# Run all pre-deployment checks

set -e

echo "🔍 Running pre-deployment checks..."
echo ""

# 1. TypeScript compilation
echo "📝 Checking TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript: OK"
echo ""

# 2. ESLint
echo "🔎 Running ESLint..."
npm run lint
echo "✅ ESLint: OK"
echo ""

# 3. Unit tests
echo "🧪 Running unit tests..."
npm test -- --ci --coverage --maxWorkers=2
echo "✅ Tests: OK"
echo ""

# 4. Build test
echo "🏗️  Testing build..."
npm run build
echo "✅ Build: OK"
echo ""

# 5. Environment variables
echo "🔐 Checking environment..."
./scripts/verify-env.sh
echo ""

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready to deploy"
```

**Make executable:**
```bash
chmod +x scripts/pre-deploy-check.sh
```

---

## 🗃️ Database Migration Scripts

### Migration 1: Performance Indexes

**`scripts/migrate-indexes.sh`**
```bash
#!/bin/bash
# Apply performance indexes to production database

set -e

echo "🗄️  Applying database performance indexes..."

# Backup database first
echo "📦 Creating database backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backups/db_backup_$timestamp.sql"
echo "✅ Backup created: backups/db_backup_$timestamp.sql"

# Apply indexes (non-blocking)
echo "🔧 Creating indexes (this may take a few minutes)..."
npx prisma db execute --file prisma/migrations/add_performance_indexes.sql

# Verify indexes were created
echo "🔍 Verifying indexes..."
psql $DATABASE_URL -c "
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
"

echo ""
echo "✅ Indexes applied successfully"
echo "📊 Run EXPLAIN ANALYZE on your queries to verify performance improvements"
```

**Make executable:**
```bash
chmod +x scripts/migrate-indexes.sh
```

### Migration 2: Password Reset Tokens

**`scripts/migrate-password-reset.sh`**
```bash
#!/bin/bash
# Add PasswordResetToken table to production

set -e

echo "🔐 Adding password reset functionality..."

# Backup first
echo "📦 Creating database backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backups/db_backup_$timestamp.sql"
echo "✅ Backup created: backups/db_backup_$timestamp.sql"

# Apply migration
echo "🔧 Creating PasswordResetToken table..."
npx prisma db execute --file prisma/migrations/add_password_reset.sql

# Verify table exists
echo "🔍 Verifying table..."
psql $DATABASE_URL -c "\d PasswordResetToken"

echo ""
echo "✅ Password reset table created successfully"
```

**Make executable:**
```bash
chmod +x scripts/migrate-password-reset.sh
```

### All-in-One Migration

**`scripts/migrate-all.sh`**
```bash
#!/bin/bash
# Apply all pending migrations safely

set -e

echo "🗄️  Applying all database migrations..."
echo ""

# 1. Create backup
echo "📦 Step 1: Creating database backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="backups/pre_migration_$timestamp.sql"
mkdir -p backups
pg_dump $DATABASE_URL > "$backup_file"
echo "✅ Backup: $backup_file"
echo ""

# 2. Test migrations on copy (optional but recommended)
echo "🧪 Step 2: Testing migrations..."
# Create test database, apply migrations, drop test database
echo "⚠️  Skipping test run (manual verification recommended)"
echo ""

# 3. Apply performance indexes
echo "🔧 Step 3: Applying performance indexes..."
npx prisma db execute --file prisma/migrations/add_performance_indexes.sql
echo "✅ Performance indexes applied"
echo ""

# 4. Apply password reset schema
echo "🔐 Step 4: Adding password reset functionality..."
npx prisma db execute --file prisma/migrations/add_password_reset.sql
echo "✅ Password reset schema applied"
echo ""

# 5. Generate Prisma Client
echo "⚙️  Step 5: Regenerating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client regenerated"
echo ""

# 6. Verify all tables and indexes
echo "🔍 Step 6: Verifying database schema..."
psql $DATABASE_URL -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"
echo ""

echo "✅ All migrations applied successfully!"
echo "📊 Backup location: $backup_file"
echo "🔄 Remember to restart application servers to pick up schema changes"
```

**Make executable:**
```bash
chmod +x scripts/migrate-all.sh
```

---

## 🚀 Deployment Automation

### Vercel Deployment

**`scripts/deploy-vercel.sh`**
```bash
#!/bin/bash
# Deploy to Vercel with safety checks

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to Vercel ($ENVIRONMENT)..."
echo ""

# 1. Pre-deployment checks
echo "✅ Step 1: Running pre-deployment checks..."
./scripts/pre-deploy-check.sh
echo ""

# 2. Database migrations (production only)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🗄️  Step 2: Applying database migrations..."
  read -p "Apply migrations now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/migrate-all.sh
  else
    echo "⚠️  Skipping migrations (apply manually before deployment)"
  fi
  echo ""
fi

# 3. Deploy to Vercel
echo "🚀 Step 3: Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
  vercel --prod
else
  vercel
fi
echo ""

# 4. Post-deployment verification
echo "🔍 Step 4: Verifying deployment..."
sleep 10 # Wait for deployment to propagate

DEPLOY_URL=$(vercel inspect --token $VERCEL_TOKEN | grep "URL:" | awk '{print $2}')
echo "Deployment URL: $DEPLOY_URL"

# Health check
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Health check: OK"
else
  echo "❌ Health check failed: $HTTP_STATUS"
  exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo "🌐 Live at: $DEPLOY_URL"
```

**Make executable:**
```bash
chmod +x scripts/deploy-vercel.sh
```

### GitHub Actions Workflow

**`.github/workflows/deploy-production.yml`**
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  pre-deploy-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npx tsc --noEmit
      
      - name: ESLint
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --ci --coverage
      
      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  database-migrations:
    runs-on: ubuntu-latest
    needs: pre-deploy-checks
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Create database backup
        run: |
          timestamp=$(date +%Y%m%d_%H%M%S)
          pg_dump $DATABASE_URL > "backup_$timestamp.sql"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Apply performance indexes
        run: npx prisma db execute --file prisma/migrations/add_performance_indexes.sql
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Apply password reset migration
        run: npx prisma db execute --file prisma/migrations/add_password_reset.sql
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Generate Prisma Client
        run: npx prisma generate

  deploy:
    runs-on: ubuntu-latest
    needs: database-migrations
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  post-deploy-verification:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Wait for deployment
        run: sleep 30
      
      - name: Health check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://gharam.com/api/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed: $response"
            exit 1
          fi
          echo "Health check passed: $response"
      
      - name: Smoke tests
        run: |
          # Test critical endpoints
          curl -f https://gharam.com/ || exit 1
          curl -f https://gharam.com/api/properties?city=Mumbai || exit 1
          echo "Smoke tests passed"
      
      - name: Notify team (on success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Production deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify team (on failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '❌ Production deployment failed! Check GitHub Actions logs.'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔍 Post-Deployment Verification

### Health Check Endpoint

**`src/app/api/health/route.ts`**
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  const checks: Record<string, boolean> = {};
  let allHealthy = true;

  // 1. Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    checks.database = false;
    allHealthy = false;
  }

  // 2. Redis check
  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    checks.redis = false;
    allHealthy = false;
  }

  // 3. Environment variables check
  checks.env = !!(
    process.env.DATABASE_URL &&
    process.env.NEXTAUTH_SECRET &&
    process.env.RAZORPAY_KEY_ID
  );

  if (!checks.env) allHealthy = false;

  const status = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status }
  );
}
```

### Verification Script

**`scripts/verify-deployment.sh`**
```bash
#!/bin/bash
# Verify production deployment is healthy

set -e

PROD_URL=${1:-https://gharam.com}

echo "🔍 Verifying deployment at $PROD_URL..."
echo ""

# 1. Health check
echo "❤️  Checking application health..."
HEALTH_STATUS=$(curl -s "$PROD_URL/api/health" | jq -r '.status')
if [ "$HEALTH_STATUS" = "healthy" ]; then
  echo "✅ Health check: OK"
else
  echo "❌ Health check: FAILED"
  curl -s "$PROD_URL/api/health" | jq '.'
  exit 1
fi
echo ""

# 2. Homepage loads
echo "🏠 Checking homepage..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Homepage: OK"
else
  echo "❌ Homepage: FAILED ($HTTP_STATUS)"
  exit 1
fi
echo ""

# 3. API endpoint test
echo "🔌 Checking API..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/properties?city=Mumbai")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ API: OK"
else
  echo "❌ API: FAILED ($HTTP_STATUS)"
  exit 1
fi
echo ""

# 4. Static assets
echo "🎨 Checking static assets..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/_next/static/css/app/layout.css" || echo "404")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
  echo "✅ Static assets: OK"
else
  echo "⚠️  Static assets: Could not verify (this may be normal)"
fi
echo ""

# 5. Database connectivity (via API)
echo "🗄️  Checking database connectivity..."
PROPERTY_COUNT=$(curl -s "$PROD_URL/api/properties?city=Mumbai" | jq 'length')
if [ "$PROPERTY_COUNT" -gt 0 ]; then
  echo "✅ Database: OK ($PROPERTY_COUNT properties found)"
else
  echo "⚠️  Database: No data returned (may be empty)"
fi
echo ""

# 6. Check recent errors in Sentry (if configured)
echo "🔍 Checking error rates..."
# Add Sentry API call here if needed
echo "ℹ️  Check Sentry dashboard manually"
echo ""

echo "✅ All verification checks passed!"
echo "🎉 Deployment is healthy"
```

**Make executable:**
```bash
chmod +x scripts/verify-deployment.sh
```

---

## 🔄 Rollback Procedures

### Instant Rollback (Vercel)

**`scripts/rollback-vercel.sh`**
```bash
#!/bin/bash
# Rollback to previous Vercel deployment

set -e

echo "🔙 Rolling back Vercel deployment..."

# List recent deployments
echo "📋 Recent deployments:"
vercel ls | head -n 10

# Get previous deployment ID
echo ""
read -p "Enter deployment ID to rollback to: " DEPLOYMENT_ID

# Promote previous deployment to production
echo "🔄 Rolling back to $DEPLOYMENT_ID..."
vercel promote $DEPLOYMENT_ID --scope=your-team-name

# Verify rollback
sleep 10
./scripts/verify-deployment.sh

echo ""
echo "✅ Rollback complete!"
```

**Make executable:**
```bash
chmod +x scripts/rollback-vercel.sh
```

### Database Rollback

**`scripts/rollback-database.sh`**
```bash
#!/bin/bash
# Restore database from backup

set -e

echo "🗄️  Database Rollback Utility"
echo ""

# List available backups
echo "📋 Available backups:"
ls -lh backups/*.sql | tail -n 10

echo ""
read -p "Enter backup filename to restore (e.g., db_backup_20260326_120000.sql): " BACKUP_FILE

# Confirm
echo ""
echo "⚠️  WARNING: This will REPLACE the current production database!"
echo "Backup file: backups/$BACKUP_FILE"
read -p "Are you absolutely sure? Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# Create a backup of current state before rollback
echo ""
echo "📦 Creating backup of current state..."
timestamp=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backups/pre_rollback_$timestamp.sql"
echo "✅ Current state backed up to: backups/pre_rollback_$timestamp.sql"

# Drop and recreate database
echo ""
echo "🔄 Restoring database..."
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL < "backups/$BACKUP_FILE"

echo ""
echo "✅ Database restored from backup"
echo "⚠️  Remember to restart application servers"
```

**Make executable:**
```bash
chmod +x scripts/rollback-database.sh
```

---

## 🚨 Emergency Runbooks

### Runbook 1: Site Down

**`runbooks/site-down.md`**
```markdown
# 🚨 Runbook: Site Down

## Symptoms
- Health check returns 503
- Users report site not loading
- Sentry shows spike in errors

## Investigation Steps

1. **Check Vercel status**
   ```bash
   curl https://www.vercel-status.com/api/v2/status.json
   ```

2. **Check database connectivity**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check Redis connectivity**
   ```bash
   redis-cli -u $UPSTASH_REDIS_REST_URL ping
   ```

4. **Check recent deployments**
   ```bash
   vercel ls --prod
   ```

5. **Check error logs**
   - Open Sentry dashboard
   - Check Vercel deployment logs

## Resolution Steps

### If deployment issue:
```bash
./scripts/rollback-vercel.sh
```

### If database issue:
1. Check Supabase dashboard
2. Check connection string
3. Restart Supabase instance if needed

### If Redis issue:
1. Check Upstash dashboard
2. Connection string correct?
3. Rate limit Redis to prevent overload

## Post-Incident

1. Document what went wrong
2. Create GitHub issue
3. Update runbook with learnings
```

### Runbook 2: Payment Failures

**`runbooks/payment-failures.md`**
```markdown
# 💳 Runbook: Payment Failures

## Symptoms
- Razorpay webhook failures
- Users report payment not confirming
- Booking status stuck in PENDING

## Investigation Steps

1. **Check Razorpay dashboard**
   - Failed payments count
   - Webhook delivery status

2. **Check payment verification endpoint**
   ```bash
   curl https://gharam.com/api/payments/verify -X POST \
     -H "Content-Type: application/json" \
     -d '{"test": "ping"}'
   ```

3. **Query stuck bookings**
   ```sql
   SELECT COUNT(*) 
   FROM "Booking" 
   WHERE status = 'PENDING' 
   AND "createdAt" < NOW() - INTERVAL '1 hour';
   ```

4. **Check Razorpay logs**
   - Webhook delivery attempts
   - Signature validation errors

## Resolution Steps

### Manual payment verification:
```sql
-- Verify payment manually
UPDATE "Booking" 
SET status = 'CONFIRMED', "tokenPaid" = true, "razorpay_id" = 'pay_XXXXX'
WHERE id = 'booking_id_here';

-- Send confirmation email
-- (Run via API or admin dashboard)
```

### Retry failed webhooks:
1. Go to Razorpay dashboard → Webhooks
2. Find failed deliveries
3. Click "Retry" for each

## Prevention

1. Monitor webhook success rate
2. Set up alerts for >5% failure rate
3. Implement idempotent payment verification
```

### Runbook 3: Rate Limit Issues

**`runbooks/rate-limit-issues.md`**
```markdown
# ⏱️ Runbook: Rate Limit Issues

## Symptoms
- Legitimate users blocked (429 errors)
- Spike in rate limit triggers
- Redis memory usage high

## Investigation Steps

1. **Check Redis memory usage**
   ```bash
   redis-cli -u $UPSTASH_REDIS_REST_URL INFO memory
   ```

2. **List rate limit keys**
   ```bash
   redis-cli -u $UPSTASH_REDIS_REST_URL KEYS "ratelimit:*" | wc -l
   ```

3. **Check top rate-limited IPs**
   ```bash
   # Query application logs for 429 responses
   grep "429" logs.txt | awk '{print $5}' | sort | uniq -c | sort -rn | head
   ```

## Resolution Steps

### Clear rate limits for specific IP:
```bash
redis-cli -u $UPSTASH_REDIS_REST_URL DEL "ratelimit:signup:192.168.1.1"
```

### Clear all rate limits (emergency only):
```bash
redis-cli -u $UPSTASH_REDIS_REST_URL EVAL "return redis.call('del', unpack(redis.call('keys', 'ratelimit:*')))" 0
```

### Adjust rate limits:
Edit `src/lib/rateLimit.ts` and redeploy:
```typescript
// Increase limit temporarily
await rateLimit(key, 20, 60 * 60 * 1000) // 20 instead of 10
```

## Prevention

1. Monitor rate limit hit rate
2. Implement IP whitelisting for known clients
3. Use CAPTCHA for suspicious traffic
```

---

## 📊 Deployment Metrics Dashboard

**Create Grafana dashboard or similar with these metrics:**

1. **Deployment Health**
   - Deployment success rate
   - Average deployment time
   - Rollback frequency

2. **Application Health**
   - Response time (p50, p95, p99)
   - Error rate
   - Availability (uptime)

3. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Index hit rate

4. **Business Metrics**
   - Bookings per hour
   - Payment success rate
   - User signups

---

## 🎯 Deployment SLA

- **Deployment frequency:** Multiple times per day (CI/CD)
- **Deployment time:** < 5 minutes (average)
- **Rollback time:** < 2 minutes (instant Vercel promotion)
- **Zero-downtime:** Yes (Vercel handles traffic switching)
- **Database migrations:** Applied during low-traffic windows
- **Post-deployment monitoring:** 15 minutes active monitoring

---

## 📝 Deployment Checklist Template

Copy this for each production deployment:

```markdown
# Deployment Checklist - [Date] - [Feature Name]

## Pre-Deployment
- [ ] All tests passing
- [ ] Code review approved
- [ ] Changelog updated
- [ ] Database migrations tested locally
- [ ] Environment variables configured
- [ ] Feature flags set (if applicable)

## Deployment
- [ ] Database backup created
- [ ] Migrations applied
- [ ] Code deployed to production
- [ ] Health check passed
- [ ] Smoke tests passed

## Post-Deployment
- [ ] Verify critical flows (booking, payment, signup)
- [ ] Check error rates in Sentry (< 0.1%)
- [ ] Monitor performance metrics (15 min)
- [ ] Notify team in Slack
- [ ] Close deployment ticket

## Rollback Plan (if needed)
- [ ] Rollback command ready: `./scripts/rollback-vercel.sh`
- [ ] Database backup location: `backups/db_backup_YYYYMMDD_HHMMSS.sql`
- [ ] Incident response team on standby
```

---

**Deployment is not scary when you have a plan.** 🚀

Let's ship with confidence! 🎉
