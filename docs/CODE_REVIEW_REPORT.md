# Comprehensive Code Review Report - Gharam (PGLife)

## Executive Summary

**Review Date:** March 26, 2026
**Codebase:** Gharam (PGLife) - Next.js 14 PG Marketplace
**Total Issues Found:** 31
**Critical:** 8 | **High:** 10 | **Medium:** 9 | **Low:** 4

---

## Issues Found

### 🔴 CRITICAL ISSUES (Priority 1)

#### 1. **SQL Injection Risk in Dynamic Prisma Queries**
- **File:** `src/app/api/properties/route.ts`
- **Line:** 27
- **Severity:** CRITICAL
- **Issue:** Using `mode: "insensitive"` with user input without proper validation
- **Risk:** Potential SQL injection through case-insensitive search
- **Fix:** Sanitize and validate city input before database query

#### 2. **Unsafe Type Assertions with `any`**
- **Files:** Multiple (`src/lib/auth.ts`, `src/app/api/properties/route.ts`)
- **Severity:** CRITICAL
- **Issue:** Extensive use of `(user as any)` and `as any` bypasses TypeScript safety
- **Risk:** Runtime type errors, missing property access, security vulnerabilities
- **Fix:** Create proper TypeScript interfaces and use type guards

#### 3. **Race Condition in Rate Limiter**
- **File:** `src/lib/rateLimit.ts`
- **Lines:** 32-36
- **Severity:** CRITICAL
- **Issue:** INCR and EXPIRE are not atomic; if crash occurs between them, keys persist forever
- **Risk:** Redis memory leak, rate limits never reset
- **Fix:** Use Lua script or Redis pipeline for atomic operations

#### 4. **Session DB Query on Every Request (N+1 Problem)**
- **File:** `src/lib/auth.ts`
- **Lines:** 86-88
- **Severity:** CRITICAL
- **Issue:** Fresh DB query on every session refresh causes massive load
- **Risk:** Database connection exhaustion, poor performance under load
- **Fix:** Cache user approval status or use database-backed sessions

#### 5. **Missing Input Validation in Payment Verification**
- **File:** `src/app/api/payments/verify\route.ts`
- **Lines:** 15
- **Severity:** CRITICAL
- **Issue:** No validation that `bookingId` matches the Razorpay order notes
- **Risk:** User A can verify payment for User B's booking
- **Fix:** Verify booking ownership before updating payment status

#### 6. **Timing Attack Vulnerability in Password Check**
- **File:** `src/lib/auth.ts`
- **Lines:** 54-59
- **Severity:** CRITICAL
- **Issue:** Dummy hash is constant and timing difference still exists
- **Risk:** Attackers can enumerate valid email addresses through timing analysis
- **Fix:** Use constant-time comparison or add random delay

#### 7. **No CSRF Protection on State-Changing Endpoints**
- **Files:** All POST/PUT/DELETE API routes
- **Severity:** CRITICAL
- **Issue:** No CSRF tokens on mutation endpoints
- **Risk:** Cross-site request forgery attacks
- **Fix:** Implement Next.js CSRF protection middleware

#### 8. **Environment Variables Not Validated at Startup**
- **Files:** Multiple (`src/lib/auth.ts`, `src/lib/cloudinary.ts`, etc.)
- **Severity:** CRITICAL
- **Issue:** Missing env vars cause runtime crashes instead of startup failures
- **Risk:** Production crashes, inconsistent behavior
- **Fix:** Validate all required env vars at application startup

---

### 🟠 HIGH SEVERITY ISSUES (Priority 2)

#### 9. **Insecure Password Storage Configuration**
- **File:** `src/app/api/auth/signup/route.ts`
- **Line:** 25
- **Severity:** HIGH
- **Issue:** bcrypt rounds = 12 is outdated (OWASP recommends 14+)
- **Fix:** Increase to 14 rounds minimum

#### 10. **Weak Email Validation Regex**
- **File:** `src/lib/validation.ts`
- **Line:** 33
- **Severity:** HIGH
- **Issue:** Regex allows invalid emails like `test@.com`, `@domain.com`
- **Fix:** Use proper email validation library (validator.js) or improve regex

#### 11. **XSS Vulnerability in Property Names**
- **Files:** `src/components/booking/BookingForm.tsx`, email templates
- **Severity:** HIGH
- **Issue:** Property names rendered without sanitization
- **Risk:** Stored XSS if malicious owner creates property with script tags
- **Fix:** Use DOMPurify or strict HTML escaping

#### 12. **No Rate Limit on Password Reset**
- **Files:** Missing implementation
- **Severity:** HIGH
- **Issue:** No password reset functionality or rate limiting
- **Risk:** Account enumeration, brute force attacks
- **Fix:** Implement password reset with strict rate limits

#### 13. **Unvalidated Redirect in Login**
- **File:** `src/middleware.ts`
- **Line:** 12-16
- **Severity:** HIGH
- **Issue:** `callbackUrl` not validated, can redirect to external malicious sites
- **Risk:** Open redirect vulnerability for phishing
- **Fix:** Validate callback URL is internal before redirecting

#### 14. **Missing Index on Critical Query Columns**
- **File:** `prisma/schema.prisma`
- **Severity:** HIGH
- **Issue:** Missing composite index on `[tenantId, status]` for bookings
- **Risk:** Slow queries as data grows
- **Fix:** Add composite indexes for common query patterns

#### 15. **Hardcoded Secrets in Source**
- **File:** `src/lib/auth.ts`
- **Line:** 56
- **Severity:** HIGH
- **Issue:** Dummy hash stored in code (should be env var)
- **Risk:** Predictable dummy hash reduces security
- **Fix:** Generate dummy hash at runtime

#### 16. **Memory Leak in Razorpay Script**
- **File:** `src/components/booking/BookingForm.tsx`
- **Lines:** 164-169
- **Severity:** HIGH
- **Issue:** Razorpay script loaded multiple times, no cleanup
- **Risk:** Memory leak on component remount
- **Fix:** Add cleanup in useEffect or use singleton pattern

#### 17. **Unsafe Direct URL Construction**
- **File:** `src/lib/email.ts`
- **Lines:** 141, 271, etc.
- **Severity:** HIGH
- **Issue:** WhatsApp URLs constructed with unescaped user input
- **Risk:** URL injection, broken links
- **Fix:** Use URLSearchParams for all query parameters

#### 18. **No Transaction Rollback on Email Failure**
- **File:** `src/app/api/auth/signup/route.ts`
- **Lines:** 27-38
- **Severity:** HIGH
- **Issue:** User created in DB even if email fails (non-blocking)
- **Risk:** Users never receive welcome emails, no audit trail
- **Fix:** Log email failures to separate table for retry

---

### 🟡 MEDIUM SEVERITY ISSUES (Priority 3)

#### 19. **Type Safety Issues in Session**
- **File:** `src/lib/auth.ts`
- **Lines:** 74-79, 90-92
- **Severity:** MEDIUM
- **Issue:** Unsafe type assertions, missing null checks
- **Fix:** Use proper type guards and zod validation

#### 20. **Missing Error Boundaries in React Components**
- **Files:** All client components
- **Severity:** MEDIUM
- **Issue:** No error boundaries to catch component errors
- **Risk:** White screen of death on errors
- **Fix:** Add error boundaries at layout level

#### 21. **No Pagination Limit Enforcement**
- **File:** `src/app/api/properties/route.ts`
- **Line:** 44
- **Severity:** MEDIUM
- **Issue:** User can request `limit=50` but no hard cap
- **Risk:** Memory exhaustion, slow queries
- **Fix:** Enforce max limit of 100

#### 22. **Weak Phone Number Validation**
- **File:** `src/lib/schemas.ts`
- **Line:** 9, 43
- **Severity:** MEDIUM
- **Issue:** Indian phone regex doesn't validate against invalid numbers
- **Fix:** Add libphonenumber-js for proper validation

#### 23. **No Image Dimension Validation**
- **File:** `src/app/api/upload/route.ts`
- **Severity:** MEDIUM
- **Issue:** No check for image dimensions, can upload 1x1 pixel images
- **Risk:** Poor UX, storage abuse
- **Fix:** Validate min/max dimensions

#### 24. **Improper Error Handling in API Routes**
- **File:** `src/lib/handler.ts`
- **Lines:** 10-21
- **Severity:** MEDIUM
- **Issue:** All errors return 500, loses error context
- **Risk:** Hard to debug, no differentiation between error types
- **Fix:** Preserve error status codes and add error categorization

#### 25. **No Soft Delete for Bookings**
- **File:** `src/app/api/profile/delete/route.ts`
- **Severity:** MEDIUM
- **Issue:** User deletion doesn't handle active bookings properly
- **Risk:** Orphaned bookings, data integrity issues
- **Fix:** Add booking status checks before deletion

#### 26. **Missing Loading States**
- **File:** `src/components/booking/BookingForm.tsx`
- **Severity:** MEDIUM
- **Issue:** No skeleton loaders, abrupt state changes
- **Risk:** Poor UX, confusion
- **Fix:** Add proper loading skeletons

#### 27. **No Request Timeout Configuration**
- **Files:** All fetch calls
- **Severity:** MEDIUM
- **Issue:** No timeout on API requests
- **Risk:** Hanging requests, poor UX
- **Fix:** Add AbortController with timeout

---

### 🔵 LOW SEVERITY ISSUES (Priority 4)

#### 28. **Unused Imports**
- **Files:** Multiple
- **Severity:** LOW
- **Issue:** Dead code increases bundle size
- **Fix:** Remove unused imports

#### 29. **Missing Alt Text on Images**
- **Files:** Various components
- **Severity:** LOW
- **Issue:** Accessibility violation
- **Fix:** Add alt text to all images

#### 30. **Console Logs in Production**
- **Files:** `src/lib/rateLimit.ts`, `src/components/booking/BookingForm.tsx`
- **Severity:** LOW
- **Issue:** console.error/warn in production
- **Fix:** Use proper logger (Sentry)

#### 31. **No TypeScript Strict Null Checks**
- **File:** `tsconfig.json`
- **Severity:** LOW
- **Issue:** Missing strictNullChecks can hide bugs
- **Fix:** Enable all strict flags

---

## Performance Issues

### Database Optimization Needed
1. **Missing Indexes:** Add composite indexes for common queries
2. **N+1 Queries:** Session refresh query on every request
3. **Connection Pooling:** Not optimized for serverless (needs pgBouncer)
4. **Select Statements:** Over-fetching data (includes instead of specific selects)

### Frontend Performance
1. **No Code Splitting:** Large bundle size
2. **No Image Optimization:** Missing width/height props
3. **No Memoization:** Components re-render unnecessarily
4. **Script Loading:** Razorpay loaded even when not needed

---

## Security Recommendations

### Immediate Actions Required
1. ✅ Fix SQL injection in city search
2. ✅ Implement CSRF protection
3. ✅ Fix race condition in rate limiter
4. ✅ Validate redirect URLs
5. ✅ Fix payment verification vulnerability
6. ✅ Increase bcrypt rounds to 14
7. ✅ Add env var validation at startup
8. ✅ Sanitize all user-generated content

### Additional Security Layers
- Add request signing for sensitive endpoints
- Implement 2FA for admin accounts
- Add IP whitelisting for admin routes
- Enable Cloudflare WAF rules
- Add security headers (already good in next.config.js)
- Implement audit logging for admin actions

---

## Testing Recommendations

### Missing Test Coverage
- Unit tests: 0%
- Integration tests: 0%
- E2E tests: 0%

### Recommended Test Suite
1. Unit tests for validation functions
2. Integration tests for payment flow
3. E2E tests for booking flow
4. Security tests for auth endpoints
5. Performance tests for database queries

---

## Dependencies to Add

```json
{
  "dependencies": {
    "dompurify": "^3.0.0",
    "validator": "^13.11.0",
    "libphonenumber-js": "^1.10.51"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

---

## Implementation Priority

### Week 1 (Critical)
- [ ] Fix payment verification vulnerability
- [ ] Fix race condition in rate limiter
- [ ] Add CSRF protection
- [ ] Validate callback URLs
- [ ] Add env var validation

### Week 2 (High)
- [ ] Fix SQL injection risks
- [ ] Increase bcrypt rounds
- [ ] Implement proper type safety
- [ ] Fix XSS vulnerabilities
- [ ] Add database indexes

### Week 3 (Medium)
- [ ] Add error boundaries
- [ ] Improve error handling
- [ ] Add request timeouts
- [ ] Optimize N+1 queries
- [ ] Add loading states

### Week 4 (Low + Testing)
- [ ] Remove unused code
- [ ] Add accessibility improvements
- [ ] Set up test framework
- [ ] Write critical path tests
- [ ] Performance monitoring

---

## Conclusion

The codebase has a solid foundation with good security practices (rate limiting, CAPTCHA, secure cookies), but has several critical vulnerabilities that need immediate attention. The most urgent issues are:

1. **Payment verification vulnerability** (user can pay for other's bookings)
2. **Race condition in rate limiter** (can cause memory leaks)
3. **N+1 queries on session refresh** (will cause performance issues at scale)
4. **Missing CSRF protection** (allows cross-site attacks)

Overall code quality is good, but needs stricter TypeScript usage and comprehensive testing.

**Estimated Time to Fix All Issues:** 3-4 weeks with 1 developer

