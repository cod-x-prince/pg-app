# PGLife - Command Reference

**Quick reference for all development, build, deployment, and monitoring commands**

---

## 🚀 Quick Start Commands

```bash
# First time setup
npm install
npx prisma generate
npx prisma db push
npm run dev

# Open in browser
# http://localhost:3000
```

---

## 📦 Installation & Setup

### Install Dependencies
```bash
npm install
# or
npm ci  # Clean install (uses package-lock.json exactly)
```

### Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (no migrations)
npx prisma db push

# Open Prisma Studio (GUI for database)
npx prisma studio
# Opens at http://localhost:5555

# Seed database (if seed script exists)
npm run db:seed
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Or for production
cp .env.production.example .env.production
```

---

## 🔧 Development Commands

### Start Development Server
```bash
# Start Next.js dev server (hot reload enabled)
npm run dev
# Runs on http://localhost:3000

# Start with specific port
npm run dev -- -p 3001

# Start with turbopack (faster, experimental)
npm run dev -- --turbo
```

### Database Development
```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull

# Format Prisma schema
npx prisma format
```

---

## 🏗️ Build Commands

### Production Build
```bash
# Full production build
npm run build

# What it does:
# 1. Runs `npx prisma generate`
# 2. Builds Next.js for production
# 3. Optimizes bundles
# 4. Generates static pages

# Check build output
ls -lh .next/

# Build size analysis
npm run build -- --profile
```

### Type Checking
```bash
# Type check without building
npx tsc --noEmit

# Type check with watch mode
npx tsc --noEmit --watch

# Check specific file
npx tsc --noEmit src/app/page.tsx
```

### Linting
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Lint specific files
npm run lint src/app/**/*.tsx

# Check specific rule
npm run lint -- --rule 'no-console: error'
```

---

## 🚀 Production Commands

### Start Production Server
```bash
# Start production server (after build)
npm start
# or
npm run start

# Start on specific port
npm start -- -p 8080
```

### Production Build + Start
```bash
# Build and start in one go
npm run build && npm start
```

---

## 🗄️ Database Commands

### Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Pull schema from database
npx prisma db pull

# Validate Prisma schema
npx prisma validate

# Format Prisma schema file
npx prisma format

# Open Prisma Studio
npx prisma studio
```

### Database Migrations (if using migrations)
```bash
# Create migration
npx prisma migrate dev --name add-kyc-model

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Database Queries (via Prisma Studio or SQL)
```bash
# Open Prisma Studio
npx prisma studio

# Or connect via psql (Supabase)
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

---

## 🧪 Testing Commands

### Manual Testing
```bash
# Start dev server for testing
npm run dev

# Test URLs
curl http://localhost:3000
curl http://localhost:3000/api/health
curl http://localhost:3000/help
```

### Health Check
```bash
# Check local health endpoint
curl http://localhost:3000/api/health

# Check production health
curl https://gharam.vercel.app/api/health

# Expected response:
# {"database":"healthy","redis":"healthy","status":"healthy","timestamp":"..."}
```

### API Testing
```bash
# Test public endpoints
curl http://localhost:3000/api/properties?city=bangalore

# Test authenticated endpoint (should return 401)
curl http://localhost:3000/api/profile

# Test with authentication
curl http://localhost:3000/api/profile \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Test localities API
curl http://localhost:3000/api/localities?city=bangalore
```

---

## 📊 Monitoring & Stats

### Check Application Stats
```bash
# Check running processes
ps aux | grep node

# Check port usage
netstat -tuln | grep 3000

# Check memory usage
node --max-old-space-size=4096 npm run dev
```

### Vercel Deployment Stats
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Check deployments
vercel ls

# View logs
vercel logs

# Check production URL
vercel inspect
```

### Database Stats
```bash
# Count records in Prisma Studio
# Or via SQL:

# Count users
echo "SELECT COUNT(*) FROM \"User\";" | psql $DATABASE_URL

# Count properties
echo "SELECT COUNT(*) FROM \"Property\" WHERE \"isActive\" = true;" | psql $DATABASE_URL

# Count bookings
echo "SELECT COUNT(*) FROM \"Booking\";" | psql $DATABASE_URL
```

### Performance Stats
```bash
# Build time
time npm run build

# Server response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

# Where curl-format.txt contains:
# time_total: %{time_total}s\n
```

---

## 🔍 Debugging Commands

### Check Environment Variables
```bash
# Print all env vars (be careful with secrets!)
printenv | grep NEXT_PUBLIC

# Check specific variables
echo $DATABASE_URL
echo $NEXT_PUBLIC_RAZORPAY_KEY_ID

# In Node.js/Next.js:
node -e "console.log(process.env.DATABASE_URL)"
```

### Check Next.js Info
```bash
# Check Next.js version
npx next --version

# Check all dependencies
npm list next
npm list react
npm list prisma

# Check outdated packages
npm outdated
```

### Debug Build Issues
```bash
# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Clean install
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
rm -rf node_modules/.prisma
npx prisma generate

# Full clean rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Bug Debugger Script
```powershell
# IMPORTANT (PowerShell): run with relative path from project root
.\bugDebugger.ps1

# Explicit modes
.\bugDebugger.ps1 -Quick
.\bugDebugger.ps1 -Full
.\bugDebugger.ps1 -Deep

# Auto-fix pass (audit/lint fixes where possible)
.\bugDebugger.ps1 -Full -FixIssues

# Save both Markdown + JSON reports
.\bugDebugger.ps1 -Quick -SaveJson
.\bugDebugger.ps1 -Deep -SaveJson

# Increase API startup wait timeout (seconds)
.\bugDebugger.ps1 -Deep -ServerStartupTimeoutSec 120

# Custom output filename
.\bugDebugger.ps1 -OutputFile "bug-report-custom.md"

# Combined advanced run
.\bugDebugger.ps1 -Deep -FixIssues -SaveJson -ServerStartupTimeoutSec 120 -OutputFile "bug-report-deep.md"
```

```bash
# Git Bash / WSL equivalent
./bugDebugger.ps1 -Deep
```

**Available parameters:**
- `-Quick`
- `-Full`
- `-Deep`
- `-FixIssues`
- `-SaveJson`
- `-ServerStartupTimeoutSec <int>`
- `-OutputFile <filename>`

**Tip:** If you see `bugDebugger.ps1 is not recognized`, use `.\\bugDebugger.ps1` (PowerShell) or `./bugDebugger.ps1` (Bash) from the repo root.

### True Deep Scan Orchestrator
```bash
# Full true deep scan (recommended for pre-release)
npm run scan:deep:true

# Fast validation mode (skip build + optional tools)
node scripts/true-deep-scan.js --quick --skip-optional --skip-build

# Keep build, skip optional external tools
node scripts/true-deep-scan.js --skip-optional
```

What this runs:
- ESLint
- Strict TypeScript checks
- Dependency audit
- Deep Bug Debugger (`-Deep -SaveJson`)
- Custom deep code reviewer
- Production build (unless skipped)
- Optional circular-dependency + duplication scans

Output:
- All artifacts are saved under `deep-scan-reports/true-deep-scan-<timestamp>/`
- Includes per-step logs plus `SUMMARY.md` and `summary.json`

### Check Logs
```bash
# View Next.js logs
npm run dev 2>&1 | tee dev.log

# View build logs
npm run build 2>&1 | tee build.log

# On Vercel (after deployment)
vercel logs [deployment-url]
```

---

## 🌐 Deployment Commands

### Vercel Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add RAZORPAY_KEY_SECRET

# Pull environment variables locally
vercel env pull .env.local

# Check deployment status
vercel ls
```

### Manual Deployment
```bash
# Build locally
npm run build

# Test production build locally
npm start

# Deploy via Git (if connected to Vercel)
git push origin main
# Vercel auto-deploys on push to main
```

---

## 🔐 Security Commands

### Check for Vulnerabilities
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force

# Check specific package
npm audit --package=next
```

### Check for Sensitive Data
```bash
# Search for hardcoded secrets
grep -r "api_key" src/
grep -r "password" src/
grep -r "secret" src/

# Check .env not committed
git status | grep .env

# Check for exposed secrets in git history
git log --all --full-history --source --oneline -- '*.env*'
```

---

## 📈 Analytics & Monitoring

### Sentry Commands
```bash
# Upload source maps (if enabled)
sentry-cli releases new $VERSION
sentry-cli releases files $VERSION upload-sourcemaps .next
sentry-cli releases finalize $VERSION

# Test Sentry integration
curl -X POST http://localhost:3000/api/test-sentry
```

### Google Analytics Check
```bash
# Verify GA4 events
# Open browser console on your site:
# gtag('event', 'test_event', { 'event_category': 'test' })

# Check GA4 real-time dashboard
# https://analytics.google.com/
```

---

## 🧹 Cleanup Commands

### Clean Build Artifacts
```bash
# Remove build output
rm -rf .next

# Remove node modules
rm -rf node_modules

# Remove Prisma client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Full clean
rm -rf .next node_modules node_modules/.cache
```

### Clean Database (DANGER!)
```bash
# Reset database (deletes all data)
npx prisma migrate reset

# Or manually drop all tables
npx prisma db push --force-reset
```

### Clean Git
```bash
# Remove untracked files (dry run)
git clean -n

# Remove untracked files (execute)
git clean -fd

# Remove ignored files too
git clean -fdx
```

---

## 🛠️ Utility Commands

### Generate Files
```bash
# Generate new API route
mkdir -p src/app/api/new-endpoint
touch src/app/api/new-endpoint/route.ts

# Generate new page
mkdir -p src/app/new-page
touch src/app/new-page/page.tsx

# Generate Prisma model
# Edit prisma/schema.prisma then:
npx prisma db push
npx prisma generate
```

### Database Backup
```bash
# Export database (Supabase/PostgreSQL)
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql

# Or use Supabase dashboard for backups
```

### Code Statistics
```bash
# Count lines of code
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l

# Count files
find src -type f | wc -l

# Count components
find src/components -name '*.tsx' | wc -l

# Count API routes
find src/app/api -name 'route.ts' | wc -l
```

---

## 🚨 Emergency Commands

### Quick Fix Pipeline
```bash
# 1. Stop everything
pkill -f "node"

# 2. Clean everything
rm -rf .next node_modules/.cache

# 3. Regenerate Prisma
npx prisma generate

# 4. Rebuild
npm run build

# 5. Restart
npm run dev
```

### Rollback Deployment (Vercel)
```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote [previous-deployment-url] --prod
```

### Database Restore
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or use Supabase dashboard:
# 1. Go to Database > Backups
# 2. Select backup
# 3. Click Restore
```

---

## 📝 Common Workflows

### First Time Setup
```bash
# 1. Clone repository
git clone [your-repo-url]
cd pglife

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Start development
npm run dev
```

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Update database schema (if changed)
npx prisma generate
npx prisma db push

# 4. Start dev server
npm run dev
```

### Before Committing
```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint code
npm run lint

# 3. Test build
npm run build

# 4. Commit
git add .
git commit -m "feat: your message"
git push
```

### Deploy to Production
```bash
# 1. Ensure everything works locally
npm run build
npm start

# 2. Run final checks
npm run lint
npx tsc --noEmit

# 3. Commit and push
git add .
git commit -m "release: v1.0.0"
git push origin main

# 4. Monitor deployment
vercel logs
# Or check Vercel dashboard

# 5. Verify production
curl https://your-domain.com/api/health
```

---

## 🎯 Quick Reference

### Most Used Commands
```bash
npm run dev                 # Start development
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Lint code
npx tsc --noEmit          # Type check
npx prisma generate       # Generate Prisma client
npx prisma db push        # Update database
npx prisma studio         # Open database GUI
curl localhost:3000/api/health  # Health check
```

### Environment Variables
```bash
# Check all public vars
printenv | grep NEXT_PUBLIC

# Check database connection
echo $DATABASE_URL

# Test with specific env file
DATABASE_URL=xxx npm run dev
```

### Port Management
```bash
# Find process on port 3000
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 🆘 Troubleshooting Commands

### "Port 3000 already in use"
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Or use different port
npm run dev -- -p 3001
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
```

### "Prisma Client not generated"
```bash
# Regenerate Prisma Client
rm -rf node_modules/.prisma
npx prisma generate

# If Windows file locking issue:
# 1. Close VS Code
# 2. Kill all Node processes
# 3. Restart computer
# 4. npx prisma generate
```

### "Build fails"
```bash
# Full clean rebuild
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

---

## 📚 Documentation Commands

### Generate Documentation
```bash
# TypeDoc (if configured)
npx typedoc src/

# Or manually maintain docs in /docs folder
```

### View Documentation
```bash
# Serve docs locally (if using MkDocs or similar)
mkdocs serve

# Or open markdown files
# code docs/README.md
```

---

**Last Updated:** March 27, 2026  
**Version:** 1.0.0  
**Maintainer:** PGLife Team

**Need Help?**
- Check `docs/RUNBOOK.md` for troubleshooting
- Check `PENDING_LAUNCH_STEPS.md` for launch guide
- Check `.env.production.example` for environment setup
