
# Security Guide

This document outlines the security features and best practices implemented in the PGLife project.

## Table of Contents

- [Content Security Policy (CSP)](#content-security-policy-csp)
- [Authentication & Authorization](#authentication--authorization)
- [Rate Limiting](#rate-limiting)
- [Data Protection](#data-protection)
- [Environment Variables](#environment-variables)
- [CAPTCHA Protection](#captcha-protection)
- [Security Headers](#security-headers)
- [Reporting Security Issues](#reporting-security-issues)

---

## Content Security Policy (CSP)

### Overview

PGLife implements a **strict, production-ready Content Security Policy** that protects against:
- Cross-Site Scripting (XSS) attacks
- Data injection attacks
- Clickjacking
- Man-in-the-Middle (MITM) attacks

### Key Features

**Production Mode:**
- ❌ No `'unsafe-inline'` for scripts or styles
- ❌ No `'unsafe-eval'` for dynamic code execution
- ✅ `upgrade-insecure-requests` enforces HTTPS
- ✅ All third-party domains explicitly whitelisted
- ✅ No wildcard domains (e.g., `*.supabase.co` replaced with specific subdomains)

**Development Mode:**
- Allows `'unsafe-inline'` and `'unsafe-eval'` for Hot Module Replacement (HMR)
- Includes Vercel Live preview domains
- All security directives still enforced

### CSP Directives

Our CSP includes all critical security directives:

| Directive | Purpose | Configuration |
|-----------|---------|---------------|
| `default-src` | Fallback for unspecified directives | `'self'` only |
| `script-src` | Control script execution | Self + trusted CDNs (no inline in prod) |
| `style-src` | Control stylesheet loading | Self + Google Fonts (no inline in prod) |
| `img-src` | Control image sources | Self + Cloudinary + Unsplash |
| `connect-src` | Control network connections | Self + APIs (Supabase, Razorpay, etc.) |
| `frame-src` | Control iframe sources | Razorpay + Cloudflare Turnstile |
| `base-uri` | Prevent `<base>` tag injection | `'self'` only |
| `form-action` | Control form submission targets | Self + Razorpay |
| `frame-ancestors` | Prevent clickjacking | `'none'` (no embedding allowed) |
| `object-src` | Block plugins (Flash, etc.) | `'none'` |
| `worker-src` | Control Web/Service Workers | Self + blob URLs |
| `manifest-src` | Control web app manifest | `'self'` only |
| `prefetch-src` | Control resource prefetching | `'self'` only |

### Configuration

The CSP is dynamically generated from environment variables to avoid hard-coding domains:

```javascript
// lib/csp.js
const buildCSP = () => {
  // Extracts Supabase subdomain from DATABASE_URL
  const supabaseHost = getSupabaseHost();
  
  // Extracts Upstash subdomain from UPSTASH_REDIS_REST_URL
  const upstashHost = getUpstashHost();
  
  // Extracts Sentry host from NEXT_PUBLIC_SENTRY_DSN
  const sentryHost = getSentryHost();
  
  // ... builds CSP with specific domains
};
```

### Whitelisted Third-Party Services

| Service | Purpose | Domains |
|---------|---------|---------|
| **Razorpay** | Payment gateway | `api.razorpay.com`, `checkout.razorpay.com`, `cdn.razorpay.com` |
| **Cloudinary** | Image hosting | `res.cloudinary.com` |
| **Supabase** | Database | Dynamic from `DATABASE_URL` |
| **Upstash** | Redis cache | Dynamic from `UPSTASH_REDIS_REST_URL` |
| **Google Fonts** | Typography | `fonts.googleapis.com`, `fonts.gstatic.com` |
| **Cloudflare Turnstile** | CAPTCHA | `challenges.cloudflare.com` |
| **Sentry** | Error tracking | Dynamic from `NEXT_PUBLIC_SENTRY_DSN` |
| **Google Analytics** | Analytics | `www.googletagmanager.com`, `analytics.google.com` |
| **Vercel** | Hosting/Analytics | `va.vercel-scripts.com`, `vitals.vercel-insights.com` |

### Testing CSP

To verify CSP is working:

1. **Check Browser Console:**
   ```
   Open DevTools → Console tab
   Look for "Content Security Policy" warnings/errors
   ```

2. **Test Third-Party Integrations:**
   - Payment: Initiate a Razorpay test transaction
   - Images: Verify Cloudinary images load correctly
   - Fonts: Check Google Fonts render properly

3. **Verify Production Mode:**
   ```bash
   NODE_ENV=production npm run build
   npm start
   # No 'unsafe-inline' should appear in CSP header
   ```

### CSP Violation Reporting (Optional)

To monitor CSP violations in production:

1. **Create Reporting Endpoint:**
   ```typescript
   // app/api/csp-report/route.ts
   export async function POST(req: Request) {
     const report = await req.json();
     console.error('CSP Violation:', report);
     // Send to logging service (Sentry, Datadog, etc.)
     return new Response(null, { status: 204 });
   }
   ```

2. **Update CSP Configuration:**
   ```javascript
   // lib/csp.js
   additionalDirectives.push('report-uri https://your-domain.com/api/csp-report');
   ```

3. **Add Report-To Header:**
   ```javascript
   // next.config.js
   {
     key: "Report-To",
     value: JSON.stringify({
       group: "csp-endpoint",
       max_age: 10886400,
       endpoints: [{ url: "https://your-domain.com/api/csp-report" }]
     })
   }
   ```

---

## Authentication & Authorization

### NextAuth.js Configuration

- **Session Strategy:** JWT (stateless)
- **Session Expiry:** 24 hours
- **Password Hashing:** bcrypt with 12 rounds
- **Providers:** 
  - Credentials (email/password)
  - Google OAuth

### Role-Based Access Control

| Role | Access Level | Protected Routes |
|------|-------------|------------------|
| `ADMIN` | Full access | `/admin/*`, all routes |
| `OWNER` | Owner dashboard | `/dashboard/*`, `/owner/*` (if approved) |
| `BROKER` | Listing management | `/dashboard/*` |
| `TENANT` | Search & booking | `/profile/*`, `/booking/*` |

### Approval Workflow

- **Owners:** Must be approved by admin before creating listings (`isApproved: true`)
- **Properties:** Must be verified by admin before appearing in search (`isVerified: true`)

### Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters
   - Maximum 128 characters (prevent DOS via bcrypt)
   - Validated with Zod schema

2. **User Enumeration Prevention:**
   - Constant-time password comparison
   - Dummy bcrypt hash on non-existent users
   - Generic error messages ("Invalid credentials")

3. **Session Security:**
   - HTTP-only cookies (no JavaScript access)
   - Secure flag in production (HTTPS only)
   - SameSite=Lax (CSRF protection)

---

## Rate Limiting

### Upstash Redis Rate Limiter

All critical endpoints are protected with rate limiting:

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| Login | 10 attempts | 15 min | IP address |
| Signup | 10 attempts | 15 min | IP address |
| Booking | 5 requests | 1 hour | User ID |
| Property Creation | 5 requests | 1 hour | User ID |
| Image Upload | 20 requests | 1 hour | User ID |

### Implementation

```typescript
import { rateLimit } from "@/lib/rateLimit";

// In API route
const rl = await rateLimit(`endpoint:${userId}`, 5, 60 * 60 * 1000);
if (!rl.success) {
  return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

### Rate Limit Headers

Responses include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets

---

## Data Protection

### Personal Data

- **Password Storage:** Bcrypt hashed, never stored in plaintext
- **Sensitive Fields:** Phone numbers, addresses, KYC documents
- **Data Access:** Only authenticated users can access own data

### DPDP Act 2023 Compliance

- **Right to Deletion:** Users can delete accounts via `/api/profile/delete`
- **Data Minimization:** Only collect necessary information
- **Purpose Limitation:** Data used only for stated purposes
- **Security Safeguards:** Encryption in transit (HTTPS), at rest (Supabase)

### Database Security

- **Connection Pooling:** Supabase session pooler for production
- **Prepared Statements:** Prisma ORM prevents SQL injection
- **Row-Level Security:** Planned for future enhancement
- **Audit Logging:** All critical actions logged

---

## Environment Variables

### Critical Security Variables

Never commit these to version control:

```bash
# Authentication
NEXTAUTH_SECRET=           # 32+ character random string
GOOGLE_CLIENT_SECRET=      # OAuth secret

# Database
DATABASE_URL=              # Supabase connection string
DIRECT_URL=                # Prisma migrations

# Payment
RAZORPAY_KEY_SECRET=       # Payment gateway secret

# Email
RESEND_API_KEY=            # Email service API key

# CAPTCHA
TURNSTILE_SECRET_KEY=      # Cloudflare secret

# Rate Limiting
UPSTASH_REDIS_REST_TOKEN=  # Redis auth token

# Error Tracking
SENTRY_AUTH_TOKEN=         # Source map uploads (optional)
```

### Environment Variable Management

1. **Development:** Use `.env.local` (gitignored)
2. **Production:** Set in Vercel dashboard (encrypted)
3. **Template:** Maintain `.env.example` (no secrets)

### Variable Naming Conventions

- `NEXT_PUBLIC_*` → Client-side (exposed to browser)
- All others → Server-side only (never exposed)

---

## CAPTCHA Protection

### Cloudflare Turnstile

- **Implemented On:** Signup form
- **Challenge Type:** Managed (automatic difficulty adjustment)
- **Privacy:** No cookies, GDPR compliant
- **Fallback:** Form disabled if CAPTCHA fails to load

### Configuration

```typescript
// Frontend (React)
<Turnstile
  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  onVerify={(token) => setTurnstileToken(token)}
/>

// Backend (API)
const verification = await fetch(
  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  {
    method: 'POST',
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  }
);
```

---

## Security Headers

### Implemented Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Dynamic (see above) | XSS prevention |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-DNS-Prefetch-Control` | `on` | Enable DNS prefetching |
| `Referrer-Policy` | `origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused features |

### Why X-Frame-Options is Removed

- CSP's `frame-ancestors 'none'` is more robust and overrides X-Frame-Options
- Modern browsers prefer CSP over legacy headers
- Eliminates redundancy and potential conflicts

---

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [your-email@domain.com] (replace with actual contact)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 7 days
- **Fix Deployment:** Within 30 days (varies by severity)
- **Public Disclosure:** After fix is deployed

### Security Updates

Subscribe to notifications:
- GitHub Security Advisories (watch repository)
- CHANGELOG.md (security fixes marked with 🔒)

---

## Security Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard
- [ ] HTTPS enforced (Vercel automatic)
- [ ] CSP tested with all third-party integrations
- [ ] Rate limiting configured and tested
- [ ] Password policies enforced (min 8 chars)
- [ ] OAuth credentials (Google) configured
- [ ] CAPTCHA (Turnstile) working on signup
- [ ] Error tracking (Sentry) configured
- [ ] Database connection pooling enabled
- [ ] No secrets in source code or git history

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers Scanner](https://securityheaders.com/)

---

**Last Updated:** January 2026  
**Maintained By:** PGLife Security Team
