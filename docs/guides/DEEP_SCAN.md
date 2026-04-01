# 🔍 DEEP SCAN - V1 Pre-Launch Readiness Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Running Scans](#running-scans)
4. [Understanding Results](#understanding-results)
5. [Pre-Launch Checklist](#pre-launch-checklist)
6. [Troubleshooting](#troubleshooting)
7. [Tool Reference](#tool-reference)

---

## Quick Start

### 🚀 Run Pre-Launch Deep Scan (Recommended for V1)

```bash
# Full comprehensive scan (2-4 hours)
npm run scan:pre-launch

# Quick mode (30-60 minutes)
npm run scan:pre-launch:quick
```

### 📊 Check Results

```bash
# Results are saved in:
deep-scan-reports/pre-launch-YYYY-MM-DDTHH-MM-SS/

# Read these files in order:
1. SUMMARY.md          - Overall pass/fail status
2. RECOMMENDATIONS.md  - What needs fixing
3. *.log               - Detailed logs of each check
```

---

## Installation

### Prerequisites
- Node.js >= 18
- npm >= 8
- PowerShell 7+ (for Windows)

### Install Dependencies

```bash
# Install all tools
npm install

# Verify installation
npm run scan:verify
```

### Installed Tools

The following tools are automatically installed:

| Tool | Purpose | Version |
|------|---------|---------|
| **madge** | Circular dependency detection | Latest |
| **jscpd** | Code duplication detection | Latest |
| **@next/bundle-analyzer** | Bundle size analysis | Latest |
| **eslint-plugin-security** | Security vulnerability detection | Latest |
| **eslint-plugin-sonarjs** | Code quality & bug detection | Latest |
| **eslint-plugin-promise** | Async/await best practices | Latest |
| **eslint-plugin-import** | Module organization | Latest |
| **eslint-plugin-react-hooks** | React Hooks rules | Latest |

---

## Running Scans

### 1. Pre-Launch Scan (V1 Readiness)

**Use this before launching to production!**

```bash
# Full scan (2-4 hours) - Recommended
npm run scan:pre-launch

# Quick scan (30-60 min) - For iteration
npm run scan:pre-launch:quick

# With verbose output
npm run scan:pre-launch -- --verbose
```

**What it checks:**
- ✅ Standard & Deep ESLint (security, quality, React)
- ✅ Strict TypeScript checking (ALL flags)
- ✅ Security audit (npm audit)
- ✅ Circular dependencies
- ✅ Code duplication (>5 lines)
- ✅ Custom deep code review
- ✅ Bug debugger deep scan
- ✅ Production build verification

**Output:**
```
deep-scan-reports/pre-launch-2026-03-29T10-30-18/
├── SUMMARY.md              # START HERE
├── RECOMMENDATIONS.md      # ACTION ITEMS
├── summary.json            # Machine-readable
├── standard-eslint.log
├── deep-eslint-all-rules.log
├── strict-typescript-check.log
├── npm-audit-production.log
├── circular-dependencies.log
├── code-duplication-detection.log
├── custom-deep-code-review.log
└── production-build.log
```

---

### 2. Daily Development Scans

**Fast checks for daily commits:**

```bash
# Standard linting (< 1 minute)
npm run lint

# Type checking (< 1 minute)
npm run type-check
```

---

### 3. Pre-PR Scans

**Before creating a pull request:**

```bash
# Deep linting with ALL rules (5-10 min)
npm run lint:deep

# Strict type checking (2-5 min)
npm run type-check:strict

# Check circular dependencies (1-2 min)
npm run analyze:deps

# Check code duplication (1-2 min)
npm run analyze:duplication
```

---

### 4. Weekly Deep Scans

**Run on Sunday nights:**

```bash
# True deep scan (1-2 hours)
npm run scan:deep

# Quick version (30 min)
npm run scan:quick

# Custom code review (1-2 hours)
npm run scan:code
```

---

## Understanding Results

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | ✅ All required checks passed | Safe to proceed |
| `1` | ❌ Required checks failed | Must fix before launch |

### Result Files

#### 1. SUMMARY.md

**What it shows:**
- Overall pass/fail status
- Duration of each check
- Phase-by-phase breakdown
- Which checks passed/failed

**Example:**
```markdown
# Pre-Launch Deep Scan Summary

**Status:** ✅ PASSED

- **Duration:** 120.5 minutes
- **Passed:** 12/14 checks

## Phase 1: Static Analysis
✅ Standard ESLint (8.4s)
❌ Deep ESLint (18.2s) [optional]
✅ Strict TypeScript Check (45.1s)
```

#### 2. RECOMMENDATIONS.md

**What it shows:**
- Critical issues that MUST be fixed
- Optional improvements
- Pre-launch checklist
- Next steps

**Example:**
```markdown
# Pre-Launch Recommendations

## ⚠️ Critical Issues (MUST FIX)

### Deep ESLint (All Rules)
- Check log file: `deep-eslint-all-rules.log`
- Exit code: 1
- Found 15 security issues

## 📋 Optional Improvements
...
```

#### 3. Individual Log Files

Each check saves detailed output:
- `standard-eslint.log` - Standard lint errors/warnings
- `strict-typescript-check.log` - Type errors
- `npm-audit-production.log` - Dependency vulnerabilities
- etc.

---

## Pre-Launch Checklist

### Phase 1: Run Scans (2-4 hours)

```bash
# Run full pre-launch scan
npm run scan:pre-launch
```

**Wait for completion, then:**

- [ ] Check `SUMMARY.md` - Did scan pass?
- [ ] Read `RECOMMENDATIONS.md` - Any critical issues?
- [ ] Review failed check logs
- [ ] Note all issues to fix

---

### Phase 2: Fix Critical Issues

**Address all REQUIRED check failures:**

1. **TypeScript Errors**
   ```bash
   # See errors
   npm run type-check:strict
   
   # Fix one by one
   # Re-run to verify
   npm run type-check:strict
   ```

2. **Security Vulnerabilities**
   ```bash
   # Check severity
   npm audit
   
   # Fix high/critical
   npm audit fix
   
   # Manual fixes if needed
   npm install package@latest
   ```

3. **Circular Dependencies**
   ```bash
   # Find circles
   npm run analyze:deps
   
   # Refactor to break cycles
   # Re-run to verify
   npm run analyze:deps
   ```

4. **Build Failures**
   ```bash
   # Try build
   npm run build
   
   # Fix errors
   # Retry
   npm run build
   ```

---

### Phase 3: Re-Run Scan

```bash
# Verify all fixes
npm run scan:pre-launch
```

- [ ] All required checks pass
- [ ] No critical issues remain
- [ ] Build succeeds

---

### Phase 4: Manual Testing

**Test critical user flows:**

- [ ] User signup (credentials + Google OAuth)
- [ ] User login
- [ ] Owner: Create PG listing
- [ ] Owner: Upload images
- [ ] Tenant: Search PGs
- [ ] Tenant: View PG details
- [ ] Tenant: Token booking
- [ ] Payment: Razorpay integration
- [ ] Email: Booking confirmations
- [ ] Admin: Approve PG
- [ ] Admin: Approve owner
- [ ] Profile: KYC verification
- [ ] Profile: Account deletion

---

### Phase 5: Configuration Verification

**Check all environment variables:**

```bash
# Required in .env
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RESEND_API_KEY=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

**Verify configurations:**
- [ ] Database connected (Supabase)
- [ ] Redis connected (Upstash)
- [ ] Cloudinary uploads working
- [ ] Razorpay test payments working
- [ ] Resend emails sending
- [ ] Turnstile CAPTCHA showing
- [ ] Sentry tracking errors
- [ ] Google OAuth working

---

### Phase 6: Security Hardening

- [ ] CSP headers configured (`next.config.js`)
- [ ] Rate limiting active (login, booking, uploads)
- [ ] HTTPS enforced
- [ ] Session expires (24 hours)
- [ ] Passwords hashed (bcrypt 12 rounds)
- [ ] SQL injection protected (Prisma)
- [ ] XSS protected (React escaping)
- [ ] CSRF tokens (NextAuth)
- [ ] No secrets in code
- [ ] `.env` not committed

---

### Phase 7: Performance Check

- [ ] Database indexes optimized
- [ ] Image optimization (Cloudinary)
- [ ] Bundle size acceptable
- [ ] API responses < 500ms
- [ ] No N+1 queries
- [ ] Lazy loading images
- [ ] Code splitting configured

---

### Phase 8: Monitoring & Backups

- [ ] Sentry error tracking working
- [ ] Vercel analytics enabled
- [ ] Database backup scheduled (Supabase)
- [ ] Log monitoring configured
- [ ] Uptime monitoring (optional)
- [ ] Alert channels configured

---

### Phase 9: Staging Deployment

```bash
# Deploy to staging/preview
git push origin main

# Test in staging
# - All features work
# - No console errors
# - Performance acceptable
# - Mobile responsive
```

---

### Phase 10: Production Launch! 🚀

- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Production env vars set
- [ ] Database migrations run
- [ ] Monitoring active
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Monitor for 24 hours

---

## Troubleshooting

### Scan Takes Too Long

```bash
# Use quick mode
npm run scan:pre-launch:quick

# Or skip specific parts
npm run scan:pre-launch -- --skip-build
npm run scan:pre-launch -- --skip-optional
```

---

### Out of Memory

```bash
# Increase Node.js memory (Windows PowerShell)
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run scan:pre-launch

# Linux/Mac
NODE_OPTIONS="--max-old-space-size=4096" npm run scan:pre-launch
```

---

### Deep ESLint Fails Everywhere

**This is expected!** Deep ESLint is intentionally strict for pre-release audits.

For daily development:
```bash
npm run lint  # Use standard config
```

For pre-release only:
```bash
npm run lint:deep  # Use deep config
```

Deep config catches issues that standard config ignores:
- Security vulnerabilities
- Complex code (cognitive complexity)
- Missing React cleanup
- Promise handling issues
- etc.

**Strategy:**
1. Run deep ESLint before release
2. Fix critical security issues
3. Ignore style/preference warnings (if acceptable)
4. Re-run to verify fixes

---

### Circular Dependencies Found

```bash
# Visualize dependencies
npm run analyze:deps

# Generate graph image (requires Graphviz)
npx madge --image deps.png src
```

**How to fix:**
1. Identify the cycle (A → B → C → A)
2. Extract shared code to new file
3. Use dependency injection
4. Refactor to break cycle

**Example:**
```typescript
// Before (circular)
// auth.ts imports user.ts
// user.ts imports auth.ts

// After (fixed)
// Create shared-types.ts
// auth.ts imports shared-types.ts
// user.ts imports shared-types.ts
```

---

### Code Duplication Detected

```bash
# Find duplicates
npm run analyze:duplication

# Output shows:
# - Duplicated code blocks
# - Files with duplication
# - % of codebase duplicated
```

**How to fix:**
1. Extract duplicate code to shared function
2. Move to `src/lib/utils.ts` or component
3. Import and reuse

**Target:** < 5% duplication

---

### Build Fails

```bash
# Try building
npm run build

# Common issues:
# 1. TypeScript errors → npm run type-check
# 2. Missing env vars → Check .env
# 3. Prisma not generated → npm run db:generate
# 4. Import errors → Check paths
```

---

## Tool Reference

### Scan Commands

| Command | Duration | Use Case |
|---------|----------|----------|
| `npm run scan:pre-launch` | 2-4 hours | V1 launch readiness |
| `npm run scan:pre-launch:quick` | 30-60 min | Faster iteration |
| `


` | 1-2 hours | Weekly check |
| `npm run scan:quick` | 30 min | Quick weekly |
| `npm run scan:code` | 1-2 hours | Custom review |
| `npm run lint` | < 1 min | Daily commit |
| `npm run lint:deep` | 5-10 min | Pre-PR check |
| `npm run type-check` | < 1 min | Daily commit |
| `npm run type-check:strict` | 2-5 min | Pre-PR check |
| `npm run analyze:deps` | 1-2 min | Check architecture |
| `npm run analyze:duplication` | 1-2 min | Find duplicates |
| `npm run scan:verify` | < 1 min | Verify setup |

---

### ESLint Configurations

#### Standard (`eslint.config.mjs`)
- Basic TypeScript rules
- Fast (< 1 minute)
- For daily development

```bash
npm run lint
```

#### Deep (`eslint.deep.config.mjs`)
- ALL strict rules
- Security + Quality + React
- Slow (5-10 minutes)
- For pre-release only

```bash
npm run lint:deep
```

**Deep config includes:**
- 50+ security patterns
- 20+ code quality patterns  
- 15+ React patterns
- 10+ async/await patterns
- Complexity limits
- Function size limits
- Nesting depth limits

---

### Analysis Tools

#### Madge (Dependency Analysis)
```bash
# Find circular dependencies
npm run analyze:deps

# Generate dependency graph
npx madge --json src > deps.json
npx madge --image deps.png src  # Requires Graphviz
```

#### JSCPD (Duplication Detection)
```bash
# Find duplicated code
npm run analyze:duplication

# Custom thresholds
npx jscpd src --min-lines 10 --min-tokens 100
```

---

## Best Practices

### When to Run Each Scan

**Daily (Before Commit):**
```bash
npm run lint
npm run type-check
```

**Before PR:**
```bash
npm run lint:deep
npm run type-check:strict
```

**Weekly (Sunday Night):**
```bash
npm run scan:deep
```

**Before Release:**
```bash
npm run scan:pre-launch
```

**Before V1 Launch:**
```bash
npm run scan:pre-launch
# + Manual testing
# + Configuration check
# + Security audit
# + Performance testing
```

---

### Recommended Workflow

1. **Feature Development**
   ```bash
   # Develop feature
   npm run lint
   npm run type-check
   git commit
   ```

2. **Before PR**
   ```bash
   npm run lint:deep
   npm run type-check:strict
   # Fix issues
   git push
   ```

3. **Weekly Maintenance**
   ```bash
   npm run scan:deep
   # Review results
   # Fix critical issues
   ```

4. **Pre-Release**
   ```bash
   npm run scan:pre-launch
   # Fix all required checks
   # Re-run until pass
   # Deploy to staging
   # Manual testing
   ```

5. **V1 Launch**
   ```bash
   npm run scan:pre-launch
   # Complete checklist
   # Deploy to production
   # Monitor 24 hours
   ```

---

## FAQ

### Q: How long does the pre-launch scan take?
**A:** 2-4 hours for full scan, 30-60 minutes for quick mode.

### Q: Can I skip some checks?
**A:** Yes, use `--skip-optional` flag. Required checks cannot be skipped.

### Q: What if a required check fails?
**A:** You must fix it before launching. Check the log file for details.

### Q: Should I fix all ESLint deep warnings?
**A:** Fix all security issues. Other warnings are optional but recommended.

### Q: How often should I run deep scans?
**A:** Weekly deep scan, full pre-launch scan before each release.

### Q: Can I run scans in CI/CD?
**A:** Yes, use `npm run scan:quick` for PR checks.

### Q: What's the difference between scan:deep and scan:pre-launch?
**A:** `scan:pre-launch` includes additional checks and generates actionable recommendations.

### Q: Is it safe to commit with ESLint deep warnings?
**A:** Yes, if you've reviewed them. Deep config is very strict.

### Q: How do I interpret circular dependency warnings?
**A:** Check `analyze:deps` output. Refactor to extract shared code.

### Q: What if the scan crashes?
**A:** Check memory limits. Increase Node.js memory or use quick mode.

---

## Support

### Documentation
- **Full Guide:** `docs/DEEP_SCAN_GUIDE.md`
- **Quick Reference:** `docs/DEEP_SCAN_QUICK_REF.md`
- **This File:** `DEEPSCAN.md`

### Getting Help
1. Check troubleshooting section above
2. Review log files in `deep-scan-reports/`
3. Run `npm run scan:verify` to check setup
4. Check individual tool docs (ESLint, madge, etc.)

---

## Version History

- **v1.0.0** (2026-03-29) - Initial release
  - Pre-launch deep scan
  - Deep ESLint config
  - Analysis tools integration
  - Comprehensive documentation

---

**Last Updated:** 2026-03-29  
**Maintainer:** PGLife Team  
**Status:** Production Ready ✅
