# PGLife — Pre-Launch Deployment Audit

**Generated:** March 2026  
**Against:** Comprehensive Web App Launch Checklist  
**Status Legend:** ✅ Done · ⚠️ Partial · ❌ Missing · 🔜 Next sprint

---

## 1. Infrastructure & Hosting

| Check                    | Status | Notes                                                           |
| ------------------------ | ------ | --------------------------------------------------------------- |
| Domain registered        | ⚠️     | `pg-app-i1h8.vercel.app` live. Need to register `pglife.in`     |
| SSL/TLS (HTTPS)          | ✅     | Vercel auto-provisions TLS. All traffic over HTTPS              |
| DNS TTL configured       | ⚠️     | Will need A/CNAME records once pglife.in is bought              |
| HSTS header              | ❌     | Missing from `next.config.js` — add `Strict-Transport-Security` |
| Appropriate hosting tier | ✅     | Vercel serverless — auto-scales, edge network                   |
| Staging environment      | ⚠️     | No dedicated staging. Vercel preview URLs used instead          |
| CDN for static assets    | ✅     | Vercel edge network + `/_next/static` immutable cache headers   |
| Database indexed         | ✅     | 12 Prisma indexes on high-frequency query columns               |
| Database backups         | ⚠️     | Supabase free tier: 7-day PITR. No manual backup schedule       |
| Connection pooling       | ✅     | PgBouncer via Supabase pooler (port 6543)                       |
| File storage             | ✅     | Cloudinary — separate from DB, auto-optimized                   |

**Action Required:**

- Register `pglife.in` via GoDaddy/Namecheap (~₹800/year)
- Add HSTS header to `next.config.js`
- Set up Supabase automated backups (paid plan or manual pg_dump cron)

---

## 2. Security

| Check                     | Status | Notes                                                            |
| ------------------------- | ------ | ---------------------------------------------------------------- |
| Force HTTPS               | ✅     | Vercel enforces HTTPS on all deployments                         |
| Strong TLS                | ✅     | Vercel uses TLS 1.2+ by default                                  |
| HSTS header               | ❌     | Not set — needs `Strict-Transport-Security: max-age=31536000`    |
| Password hashing          | ✅     | bcrypt cost factor 12                                            |
| MFA                       | ❌     | Not implemented — not critical for v1                            |
| Role-based access control | ✅     | TENANT/OWNER/BROKER/ADMIN enforced on every route                |
| HTTP-only cookies         | ✅     | NextAuth sets httpOnly, secure, sameSite=lax                     |
| CSRF protection           | ✅     | NextAuth CSRF token built-in                                     |
| SQL injection             | ✅     | Prisma parameterized queries — zero raw SQL                      |
| XSS protection            | ✅     | CSP headers + React auto-escaping                                |
| Input validation (server) | ✅     | Zod schemas on all 23 API routes                                 |
| File upload validation    | ✅     | Type whitelist + size limits + Cloudinary isolation              |
| Rate limiting             | ✅     | Upstash Redis — persistent sliding window                        |
| CAPTCHA on signup         | ✅     | Cloudflare Turnstile (gracefully disabled without key)           |
| WAF                       | ⚠️     | Vercel has basic DDoS protection. No dedicated WAF rule set      |
| CSP headers               | ✅     | Comprehensive, environment-aware                                 |
| X-Frame-Options           | ✅     | `DENY` set                                                       |
| X-Content-Type-Options    | ✅     | `nosniff` set                                                    |
| Referrer-Policy           | ✅     | `strict-origin-when-cross-origin`                                |
| Permissions-Policy        | ✅     | camera/mic/geolocation blocked                                   |
| npm audit                 | ⚠️     | 4 high severity in `eslint/glob` (dev-only, not shipped to prod) |
| Dependency scanning       | ❌     | No automated Snyk/Dependabot configured                          |
| Penetration testing       | ❌     | Not done — recommended before accepting real payments            |
| Brute force protection    | ✅     | Login rate limit: 10 attempts per IP per 15 min                  |
| Secrets management        | ✅     | All in Vercel env vars, never in code                            |

**Action Required:**

- Add HSTS header (5 min fix)
- Enable GitHub Dependabot for automated vulnerability PRs
- Run basic OWASP ZAP scan before Razorpay goes live
- Upgrade Razorpay to live keys only after pen test

---

## 3. Performance & Optimization

| Check                | Status | Notes                                                     |
| -------------------- | ------ | --------------------------------------------------------- |
| JS/CSS minification  | ✅     | Next.js production build auto-minifies                    |
| Image optimization   | ✅     | Cloudinary AVIF/WebP + Next.js Image component            |
| Lazy loading         | ✅     | Next.js Image lazy by default, `priority` on hero         |
| Gzip/Brotli          | ✅     | `compress: true` in `next.config.js`                      |
| Browser caching      | ✅     | `/_next/static` immutable (1 year), `/images` 24hr        |
| N+1 query prevention | ✅     | Prisma `include` with nested selects throughout           |
| Database caching     | ⚠️     | `/api/stats` has 1hr revalidate. No other caching layer   |
| Redis caching        | ⚠️     | Upstash used for rate limiting only — not query caching   |
| Async processing     | ⚠️     | Emails sent inline (non-blocking try/catch). No job queue |
| CLS elimination      | ✅     | Explicit `sizes` + `fill` on all images                   |
| Core Web Vitals      | ⚠️     | Not measured post-redesign. Run Lighthouse                |
| Load testing         | ❌     | Not done. Supabase free tier: ~60 connections max         |

**Action Required:**

- Run Lighthouse on live URL after dark redesign deploys
- Test Supabase connection limits under load (free tier has 60 max connections)
- Consider Resend email queue for high-volume sending

---

## 4. Testing & Quality Assurance

| Check                   | Status | Notes                                                         |
| ----------------------- | ------ | ------------------------------------------------------------- |
| Unit tests              | ❌     | No tests written yet                                          |
| Integration tests       | ❌     | No tests written yet                                          |
| E2E tests               | ❌     | No Playwright/Cypress tests                                   |
| Production health check | ✅     | `scripts/health-check.ts` — 38 routes tested                  |
| Cross-browser testing   | ⚠️     | Not formally tested. Chrome/Edge likely fine. Safari untested |
| Mobile responsiveness   | ✅     | Mobile filter drawer, sticky CTA, responsive grid             |
| Accessibility           | ⚠️     | `focus-visible` rings added. Full axe audit not done          |
| 404 page                | ✅     | `not-found.tsx` implemented                                   |
| 500 page                | ✅     | `global-error.tsx` + error boundaries                         |
| Stack trace exposure    | ✅     | `withHandler()` returns clean JSON — no traces                |
| UAT                     | ❌     | No external beta testers yet                                  |

**Action Required:**

- Run health check script against live URL: `npx tsx scripts/health-check.ts https://pg-app-i1h8.vercel.app`
- Test on Safari (iOS + macOS) — especially the dark glass effects
- Run axe DevTools on homepage + property detail + login

---

## 5. Monitoring & Observability

| Check                   | Status | Notes                                                         |
| ----------------------- | ------ | ------------------------------------------------------------- |
| Uptime monitoring       | ❌     | Not configured — site could be down for hours undetected      |
| Error tracking (server) | ✅     | Sentry — server + edge initialized via `instrumentation.ts`   |
| Error tracking (client) | ✅     | Sentry — client initialized via `instrumentation-client.ts`   |
| Performance monitoring  | ⚠️     | Sentry `tracesSampleRate: 0.1` set. No APM dashboard reviewed |
| Vercel Analytics        | ✅     | Installed — anonymous page views                              |
| Log management          | ⚠️     | Vercel runtime logs available. No centralized log aggregation |
| Real User Monitoring    | ⚠️     | Sentry session replay at 10% rate                             |
| Source maps             | ⚠️     | Not uploaded to Sentry (needs `SENTRY_AUTH_TOKEN`)            |

**Action Required:**

- Set up [UptimeRobot](https://uptimerobot.com) free tier — monitors every 5 min, emails on downtime (10 min)
- Add `SENTRY_AUTH_TOKEN` to get readable stack traces
- Review Sentry dashboard after first real users hit the app

---

## 6. Compliance & Legal

| Check                   | Status | Notes                                                               |
| ----------------------- | ------ | ------------------------------------------------------------------- |
| Privacy Policy          | ✅     | `/privacy` — DPDP Act 2023 compliant, 7 sections                    |
| Terms of Service        | ✅     | `/terms` — 12 sections, Indian law, arbitration clause              |
| Cookie consent banner   | ❌     | No banner. Uses session cookie only (necessary = no consent needed) |
| DPDP Act 2023           | ✅     | Data collection, rights, retention documented                       |
| Data deletion mechanism | ⚠️     | Documented in Privacy Policy. No in-app deletion button             |
| WCAG accessibility      | ⚠️     | `focus-visible` done. Full WCAG 2.1 audit not complete              |
| Image/font rights       | ✅     | Unsplash (free), Google Fonts (free), SVG icons (own)               |
| Payment compliance      | ⚠️     | Razorpay test keys. Need KYC + live keys before real money          |
| GST registration        | ❌     | Needed before accepting payments — consult CA                       |

**Action Required:**

- Add in-app "Delete My Account" button in dashboard settings
- Complete Razorpay KYC for live payment processing
- Register for GST (if turnover > ₹20L) — consult CA Vakil
- Cookie banner not strictly needed (only using necessary session cookie)

---

## 7. Deployment Process

| Check                        | Status | Notes                                                          |
| ---------------------------- | ------ | -------------------------------------------------------------- |
| CI/CD pipeline               | ❌     | No GitHub Actions. Manual `npx vercel --prod --force`          |
| Auto-deploy on push          | ⚠️     | Vercel can auto-deploy but webhook was unreliable              |
| Zero-downtime deployment     | ✅     | Vercel serverless = instant atomic deployments                 |
| Rollback plan                | ✅     | Vercel dashboard → previous deployment → Promote to production |
| Secrets in env vars          | ✅     | All keys in Vercel Environment Variables                       |
| Config separate from code    | ✅     | `.env.example` documents all vars, never hardcoded             |
| Database migrations          | ⚠️     | `prisma db push` — no formal migration history (risky in prod) |
| Migration testing on staging | ❌     | No staging DB — pushes go directly to production               |
| Automated backups            | ⚠️     | Supabase 7-day PITR on free tier                               |
| Backup restore tested        | ❌     | Never tested a restore                                         |

**Action Required:**

- Set up GitHub Actions for auto-deploy (30 min — use Vercel GitHub integration)
- Switch from `prisma db push` to `prisma migrate deploy` for production
- Test Supabase restore once on a throwaway project

---

## 8. Scalability & Future Growth

| Check                     | Status | Notes                                                  |
| ------------------------- | ------ | ------------------------------------------------------ |
| Stateless design          | ✅     | Vercel serverless — no server state                    |
| Session store             | ✅     | JWT sessions — no shared session store needed          |
| API rate limits           | ✅     | Upstash Redis rate limiting on all sensitive endpoints |
| Database read replicas    | ❌     | Not set up — Supabase Pro plan needed                  |
| Queue for background jobs | ❌     | Emails sent inline — fine for v1                       |
| Cost monitoring           | ⚠️     | No Vercel spend alert configured                       |
| Auto-scale                | ✅     | Vercel serverless scales to zero and up automatically  |

**Action Required:**

- Set Vercel spend alert: Settings → Billing → Spend Limit (₹500/month alert)
- Monitor Supabase connection count — free tier allows 60 simultaneous

---

## 9. Documentation

| Check                | Status | Notes                                                    |
| -------------------- | ------ | -------------------------------------------------------- |
| README               | ✅     | Comprehensive — architecture, setup, tech stack, roadmap |
| API documentation    | ❌     | No OpenAPI/Swagger spec                                  |
| Runbook              | ❌     | No incident response documentation                       |
| Architecture diagram | ⚠️     | Described in README, not visualized                      |
| Status page          | ❌     | No public status page                                    |

**Action Required:**

- Runbook is optional for v1 — add when team grows
- Status page: Vercel provides one at `vercel.com/parmbeer-singhs-projects/pg-app-i1h8`

---

## 10. Post-Launch

| Check                | Status | Notes                                           |
| -------------------- | ------ | ----------------------------------------------- |
| Monitoring ready     | ✅     | Sentry + Vercel Analytics + health-check script |
| Feedback mechanism   | ⚠️     | `support@pglife.in` in footer. No in-app survey |
| Hotfix process       | ⚠️     | Manual. No formal incident response             |
| Maintenance schedule | ❌     | Not defined                                     |

---

## Summary

### Ready for soft launch ✅

- Core marketplace works end-to-end
- Auth, bookings, admin panel, dashboards
- Security headers, rate limiting, CAPTCHA
- Sentry error monitoring
- Privacy Policy + Terms of Service
- Health check script covering 38 routes

### Must fix before accepting real money 🔴

1. **HSTS header** — 5 min fix in `next.config.js`
2. **Razorpay KYC** — complete on razorpay.com dashboard
3. **GST registration** — consult CA before first transaction
4. **UptimeRobot** — free, 10 min to set up
5. **Sentry auth token** — readable stack traces in production
6. **GitHub Dependabot** — automated security alerts

### Before full public launch 🟡

1. **Domain** — buy `pglife.in`, point to Vercel
2. **Resend domain** — verify `pglife.in`, change FROM email
3. **Run Lighthouse** — Core Web Vitals after dark redesign
4. **Safari testing** — especially glassmorphism effects
5. **GitHub Actions CI/CD** — automate deploys
6. **Switch to Prisma migrations** — replace `prisma db push`
7. **Load test** — Supabase free tier connection limits

### Nice to have before scale 🟢

- axe DevTools accessibility audit
- OpenAPI spec for API documentation
- Public status page
- In-app account deletion
- Read replicas on Supabase
- Email queue for high-volume sending

---

_Audit conducted March 2026 against the Comprehensive Web App Launch Checklist._  
_Next audit: before first 100 real users or before accepting live payments._
