# Production Deployment Runbook

## Quick Reference

**Production URL:** https://gharam.in  
**Hosting:** Vercel  
**Database:** Supabase (PostgreSQL)  
**CDN:** Cloudinary  
**Monitoring:** Sentry

---

## Common Issues & Solutions

### 1. Database Connection Errors

**Symptoms:**
- "P1001: Can't reach database server"
- 500 errors on API routes
- Timeouts on database queries

**Diagnosis:**
```bash
# Test connection
curl https://gharam.in/api/health

# Check database status in Supabase dashboard
# Verify connection pooler is active
```

**Solutions:**
1. **Connection Pool Exhausted:** Restart Supabase connection pooler in dashboard
2. **Wrong DATABASE_URL:** Verify uses `?pgbouncer=true` for pooled connection
3. **IP Restrictions:** Check Supabase allowlist includes Vercel IPs

---

### 2. Razorpay Payment Failures

**Symptoms:**
- Payment button not loading
- "Invalid key_id" errors
- Payments stuck in "pending"

**Diagnosis:**
```bash
# Check Razorpay API status
curl https://api.razorpay.com/v1/payments -u rzp_live_XXX:secret

# Test webhook endpoint
curl -X POST https://gharam.in/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Solutions:**
1. **Live Mode Not Active:** Switch from test to live keys in Razorpay dashboard + env vars
2. **Webhook URL Wrong:** Update webhook URL in Razorpay: `https://gharam.in/api/payments/webhook`
3. **Signature Mismatch:** Verify `RAZORPAY_KEY_SECRET` matches dashboard

---

### 3. Image Upload Failures

**Symptoms:**
- 413 Payload Too Large
- Uploads timing out
- Images not displaying

**Diagnosis:**
```bash
# Test Cloudinary config
curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload \
  -F "file=@test.jpg" \
  -F "api_key=YOUR_API_KEY" \
  -F "timestamp=$(date +%s)" \
  -F "signature=SIGNATURE"
```

**Solutions:**
1. **File Too Large:** Enforce 5MB limit client-side, show clear error
2. **Wrong Cloud Name:** Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in env
3. **API Limits Exceeded:** Check Cloudinary quota, upgrade plan if needed

---

### 4. Redis/Rate Limiting Issues

**Symptoms:**
- "429 Too Many Requests" on all users
- Rate limits not working (abuse possible)
- Connection timeouts to Redis

**Diagnosis:**
```bash
# Check Redis connectivity
curl https://gharam.in/api/health

# Test rate limit manually
for i in {1..15}; do
  curl https://gharam.in/api/auth/login
done
```

**Solutions:**
1. **Redis Down:** Check Upstash dashboard, restart if needed
2. **Wrong Credentials:** Verify `UPSTASH_REDIS_REST_URL` and token
3. **Too Strict Limits:** Temporarily increase limits in `src/lib/rateLimit.ts`

---

### 5. Email Delivery Issues

**Symptoms:**
- Emails not arriving
- Emails in spam
- "Invalid API key" errors

**Diagnosis:**
```bash
# Test Resend API
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@gharam.in","to":"test@example.com","subject":"Test","html":"Test"}'

# Check SPF/DKIM records
dig txt gharam.in
dig txt _dmarc.gharam.in
```

**Solutions:**
1. **Domain Not Verified:** Verify domain in Resend dashboard, add DNS records
2. **SPF/DKIM Missing:** Add TXT records from Resend to DNS:
   - SPF: `v=spf1 include:resend.com ~all`
   - DKIM: Copy from Resend dashboard
3. **Wrong From Address:** Use `noreply@gharam.in` (verified domain)

---

### 6. Session/Authentication Issues

**Symptoms:**
- Users logged out randomly
- "Unauthorized" on all requests
- Session expires too quickly

**Diagnosis:**
```bash
# Check NextAuth config
curl -I https://gharam.in/api/auth/session

# Verify JWT secret is set
echo $NEXTAUTH_SECRET | wc -c  # Should be >= 32 chars
```

**Solutions:**
1. **Wrong NEXTAUTH_URL:** Must match production domain exactly
2. **Short Session:** Increase `maxAge` in `src/lib/auth.ts` (currently 24h)
3. **Cookie Issues:** Check `secure: true` and `sameSite: "lax"` in cookies

---

### 7. Build/Deployment Failures

**Symptoms:**
- "Module not found" errors
- TypeScript compilation errors
- Deployment stuck

**Diagnosis:**
```bash
# Local build test
npm run build

# Check Vercel logs
vercel logs --prod

# Verify all env vars set
vercel env ls
```

**Solutions:**
1. **Missing Env Vars:** Add all from `.env.production.example` to Vercel dashboard
2. **Prisma Client:** Run `npx prisma generate` before build (automatic in build script)
3. **Out of Memory:** Upgrade Vercel plan or optimize build

---

## Emergency Procedures

### Rollback to Previous Version

```bash
# Via Vercel CLI
vercel rollback

# Or via dashboard: Deployments → Previous deployment → "Promote to Production"
```

### Take Site Offline (Maintenance Mode)

1. Create `src/app/maintenance/page.tsx`:
```tsx
export default function Maintenance() {
  return <div>We'll be back soon! Scheduled maintenance in progress.</div>
}
```

2. Add redirect in `src/middleware.ts`:
```ts
if (process.env.MAINTENANCE_MODE === "true") {
  return NextResponse.redirect(new URL("/maintenance", req.url))
}
```

3. Set `MAINTENANCE_MODE=true` in Vercel env vars

### Database Rollback

```bash
# Restore from Supabase backup
# 1. Go to Supabase dashboard → Database → Backups
# 2. Select backup point
# 3. Click "Restore"
# 4. Wait 5-10 minutes
# 5. Test with curl https://gharam.in/api/health
```

---

## Escalation Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Database down | Supabase Support (support@supabase.com) | 2-4 hours |
| Payment failures | Razorpay Support (support@razorpay.com) | 1-2 hours |
| Vercel deployment | Vercel Support (vercel.com/support) | 4-8 hours |
| Critical errors | Developer (your-email@example.com) | Immediate |

---

## Monitoring & Alerts

### Health Checks
- **Endpoint:** `https://gharam.in/api/health`
- **Uptime Monitor:** Set up UptimeRobot/Pingdom to ping every 5 min
- **Alerts:** Email + SMS on downtime

### Sentry Alerts
- **Critical Errors:** Email immediately (payment, auth, database)
- **Warning Errors:** Daily digest
- **Performance:** Alert if API response > 2s

### Database Alerts
- **Connection Pool:** Alert if > 80% utilization
- **Query Performance:** Alert if query > 5s
- **Disk Space:** Alert if > 80% full

---

## Performance Optimization

### Slow API Routes
1. Check Sentry performance monitoring
2. Add database indexes if missing
3. Implement caching with Redis
4. Optimize Prisma queries (use `select` instead of fetching all fields)

### High Memory Usage
1. Check for memory leaks in long-running processes
2. Optimize image sizes (use Cloudinary transformations)
3. Upgrade Vercel plan if needed

### Slow Page Loads
1. Analyze with Vercel Analytics
2. Optimize images (lazy loading, WebP format)
3. Reduce bundle size (check `npm run analyze`)

---

## Backup & Recovery

### Automated Backups
- **Database:** Supabase daily backups (7-day retention)
- **Images:** Cloudinary auto-backup
- **Code:** Git repository (GitHub)

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Download from Supabase dashboard:
# Database → Backups → Download
```

### Disaster Recovery Steps
1. Restore database from latest backup (Supabase dashboard)
2. Redeploy last known good version (Vercel rollback)
3. Verify all services healthy (`/api/health`)
4. Test critical flows (signup, login, booking)
5. Notify users if data loss occurred

---

## Security Incidents

### Suspected Data Breach
1. **Immediate:** Rotate all API keys and secrets
2. **Investigate:** Check Sentry for suspicious errors, Vercel logs for unusual traffic
3. **Notify:** Email affected users within 24 hours
4. **Fix:** Patch vulnerability, deploy immediately
5. **Report:** File incident report, consider security audit

### DDoS Attack
1. **Verify:** Check Vercel analytics for spike in traffic
2. **Mitigate:** Enable Vercel DDoS protection (Pro plan)
3. **Block:** Add IP ranges to blocklist if identified
4. **Monitor:** Watch Sentry for elevated error rates

---

## Routine Maintenance

### Weekly
- Review Sentry errors (top 10)
- Check database query performance
- Monitor Cloudinary usage
- Review Razorpay transaction failures

### Monthly
- Update dependencies (`npm outdated`, then `npm update`)
- Review and optimize slow API routes
- Check disk space usage
- Test backup restoration

### Quarterly
- Security audit (npm audit, Snyk)
- Performance review (Core Web Vitals)
- Cost optimization (review usage of all services)
- User feedback review

---

**Last Updated:** March 27, 2026  
**Version:** 1.0.0
