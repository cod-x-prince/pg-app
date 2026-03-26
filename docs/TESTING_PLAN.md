# 🧪 Comprehensive Testing Plan

**Project:** Gharam (PGLife) - PG Accommodation Marketplace  
**Testing Strategy:** Multi-layer testing with focus on security, payments, and user flows  
**Frameworks:** Jest (unit), Playwright (E2E), k6 (performance)

---

## 📋 Table of Contents

1. [Testing Infrastructure Setup](#testing-infrastructure-setup)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [End-to-End Tests](#end-to-end-tests)
5. [Security Tests](#security-tests)
6. [Performance Tests](#performance-tests)
7. [Manual Testing Checklist](#manual-testing-checklist)
8. [CI/CD Integration](#cicd-integration)

---

## 🛠️ Testing Infrastructure Setup

### 1. Install Dependencies

```bash
# Unit testing framework
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

# E2E testing framework
npm install --save-dev @playwright/test
npx playwright install chromium # Lightweight for CI

# API testing
npm install --save-dev supertest @types/supertest

# Performance testing
npm install --save-dev k6

# Test database
npm install --save-dev dotenv-cli
```

### 2. Configuration Files

**`jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**`playwright.config.ts`**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { channel: 'chromium' } },
  ],
});
```

**`.env.test`** (Test environment variables)
```bash
# Test database (separate from production)
DATABASE_URL="postgresql://user:pass@localhost:5432/gharam_test"
DIRECT_URL="postgresql://user:pass@localhost:5432/gharam_test"

# NextAuth (use test secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-min-32-characters-long"

# Disable external services in tests
SKIP_ENV_VALIDATION=true

# Mock API keys (or use test credentials)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="test_..."
RESEND_API_KEY="re_test_..."
CLOUDINARY_CLOUD_NAME="test"
CLOUDINARY_API_KEY="test"
CLOUDINARY_API_SECRET="test"
```

### 3. Test Database Setup

**`tests/setup-test-db.ts`**
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupTestDatabase() {
  // Reset test database
  await execAsync('npx prisma migrate reset --force --skip-seed');
  
  // Seed with test data
  await execAsync('npx prisma db seed');
  
  console.log('✅ Test database ready');
}

export async function teardownTestDatabase() {
  // Clean up
  await execAsync('npx prisma migrate reset --force --skip-generate');
}
```

---

## 🧩 Unit Tests

### Security Library Tests

**`tests/unit/lib/passwordReset.test.ts`**
```typescript
import { 
  generateResetToken, 
  hashToken, 
  createPasswordResetToken,
  verifyResetToken,
  invalidateResetToken 
} from '@/lib/passwordReset';
import { prisma } from '@/lib/prisma';

describe('Password Reset System', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterEach(async () => {
    await prisma.passwordResetToken.deleteMany();
  });

  describe('generateResetToken', () => {
    it('should generate a 43-character base64url token', () => {
      const token = generateResetToken();
      expect(token).toHaveLength(43); // 32 bytes * 4/3 (base64) = 43 chars
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/); // base64url charset
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 1000; i++) {
        tokens.add(generateResetToken());
      }
      expect(tokens.size).toBe(1000); // All unique
    });
  });

  describe('hashToken', () => {
    it('should produce a 64-character SHA-256 hex hash', () => {
      const hash = hashToken('test-token');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should be deterministic', () => {
      const hash1 = hashToken('test');
      const hash2 = hashToken('test');
      expect(hash1).toBe(hash2);
    });
  });

  describe('createPasswordResetToken', () => {
    it('should create token in database', async () => {
      const token = await createPasswordResetToken('user@example.com');
      
      const hashedToken = hashToken(token);
      const dbToken = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
      });

      expect(dbToken).toBeTruthy();
      expect(dbToken?.email).toBe('user@example.com');
    });

    it('should delete old tokens for same email', async () => {
      await createPasswordResetToken('user@example.com');
      await createPasswordResetToken('user@example.com'); // Should delete first
      
      const count = await prisma.passwordResetToken.count({
        where: { email: 'user@example.com' },
      });

      expect(count).toBe(1); // Only latest token exists
    });

    it('should set expiration to 1 hour from now', async () => {
      const token = await createPasswordResetToken('user@example.com');
      const hashedToken = hashToken(token);
      const dbToken = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
      });

      const now = Date.now();
      const expiresAt = dbToken!.expiresAt.getTime();
      const oneHour = 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThanOrEqual(now + oneHour + 5000); // 5s tolerance
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid token', async () => {
      const token = await createPasswordResetToken('valid@example.com');
      const result = await verifyResetToken(token);

      expect(result.valid).toBe(true);
      expect(result.email).toBe('valid@example.com');
      expect(result.error).toBeUndefined();
    });

    it('should reject expired token', async () => {
      const token = await createPasswordResetToken('expired@example.com');
      const hashedToken = hashToken(token);

      // Force expiration by updating database
      await prisma.passwordResetToken.update({
        where: { token: hashedToken },
        data: { expiresAt: new Date(Date.now() - 1000) }, // 1 second ago
      });

      const result = await verifyResetToken(token);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should reject invalid token', async () => {
      const result = await verifyResetToken('invalid-token');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired token');
    });
  });

  describe('invalidateResetToken', () => {
    it('should delete token from database', async () => {
      const token = await createPasswordResetToken('delete@example.com');
      await invalidateResetToken(token);

      const hashedToken = hashToken(token);
      const dbToken = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
      });

      expect(dbToken).toBeNull();
    });

    it('should not throw if token does not exist', async () => {
      await expect(
        invalidateResetToken('non-existent-token')
      ).resolves.not.toThrow();
    });
  });
});
```

**`tests/unit/lib/rateLimit.test.ts`**
```typescript
import { rateLimit } from '@/lib/rateLimit';
import { redis } from '@/lib/redis';

describe('Rate Limiter', () => {
  beforeEach(async () => {
    // Clear Redis keys
    const keys = await redis.keys('ratelimit:test:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  it('should allow requests within limit', async () => {
    const result1 = await rateLimit('test:user1', 5, 60000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = await rateLimit('test:user1', 5, 60000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it('should block requests exceeding limit', async () => {
    // Use up all 5 requests
    for (let i = 0; i < 5; i++) {
      await rateLimit('test:user2', 5, 60000);
    }

    // 6th request should be blocked
    const result = await rateLimit('test:user2', 5, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after expiry window', async () => {
    // Use up limit with 1-second window
    await rateLimit('test:user3', 2, 1000);
    await rateLimit('test:user3', 2, 1000);

    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be allowed again
    const result = await rateLimit('test:user3', 2, 1000);
    expect(result.success).toBe(true);
  }, 10000);

  it('should handle concurrent requests atomically', async () => {
    // Fire 10 concurrent requests (limit is 5)
    const promises = Array(10).fill(null).map(() => 
      rateLimit('test:user4', 5, 60000)
    );

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    expect(successCount).toBe(5); // Exactly 5 allowed
    expect(failureCount).toBe(5); // Exactly 5 blocked
  });
});
```

**`tests/unit/lib/csrf.test.ts`**
```typescript
import { generateCsrfToken, validateCsrfToken } from '@/lib/csrf';

describe('CSRF Protection', () => {
  it('should generate 32-character token', () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(32);
    expect(token).toMatch(/^[0-9a-f]+$/); // Hex charset
  });

  it('should validate matching tokens', () => {
    const token = 'a'.repeat(32);
    const isValid = validateCsrfToken(token, token);
    expect(isValid).toBe(true);
  });

  it('should reject mismatched tokens', () => {
    const token1 = 'a'.repeat(32);
    const token2 = 'b'.repeat(32);
    const isValid = validateCsrfToken(token1, token2);
    expect(isValid).toBe(false);
  });

  it('should reject empty tokens', () => {
    const isValid = validateCsrfToken('', '');
    expect(isValid).toBe(false);
  });

  it('should use constant-time comparison', () => {
    // This test checks that execution time doesn't leak information
    const token = 'a'.repeat(32);
    const wrong1 = 'b' + 'a'.repeat(31); // Different first char
    const wrong2 = 'a'.repeat(31) + 'b'; // Different last char

    const start1 = performance.now();
    validateCsrfToken(token, wrong1);
    const time1 = performance.now() - start1;

    const start2 = performance.now();
    validateCsrfToken(token, wrong2);
    const time2 = performance.now() - start2;

    // Times should be similar (within 1ms)
    expect(Math.abs(time1 - time2)).toBeLessThan(1);
  });
});
```

### Validation Tests

**`tests/unit/lib/sanitize.test.ts`**
```typescript
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '@/lib/sanitize';

describe('Input Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const dirty = '<div onclick="alert()">Click</div>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onclick');
    });
  });

  describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeText(input);
      expect(output).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow HTTPS URLs', () => {
      const url = 'https://example.com/path';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should block javascript: URLs', () => {
      const url = 'javascript:alert("xss")';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should block data: URLs', () => {
      const url = 'data:text/html,<script>alert()</script>';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });
  });
});
```

---

## 🔗 Integration Tests

### API Endpoint Tests

**`tests/integration/api/auth/signup.test.ts`**
```typescript
import request from 'supertest';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'http://localhost:3000';

describe('POST /api/auth/signup', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test-' } },
    });
  });

  it('should create new user successfully', async () => {
    const response = await request(BASE_URL)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test-signup@example.com',
        password: 'SecurePass123!',
        phone: '9876543210',
        role: 'TENANT',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // Verify user in database
    const user = await prisma.user.findUnique({
      where: { email: 'test-signup@example.com' },
    });
    expect(user).toBeTruthy();
    expect(user?.name).toBe('Test User');
  });

  it('should reject duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test-duplicate@example.com',
      password: 'SecurePass123!',
      phone: '9876543210',
      role: 'TENANT',
    };

    // First signup
    await request(BASE_URL).post('/api/auth/signup').send(userData);

    // Second signup with same email
    const response = await request(BASE_URL)
      .post('/api/auth/signup')
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('already exists');
  });

  it('should enforce rate limiting (10 per 15 min)', async () => {
    const promises = [];
    for (let i = 0; i < 11; i++) {
      promises.push(
        request(BASE_URL)
          .post('/api/auth/signup')
          .send({
            name: `User ${i}`,
            email: `test-ratelimit-${i}@example.com`,
            password: 'SecurePass123!',
          })
      );
    }

    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  }, 30000);

  it('should hash passwords with bcrypt', async () => {
    await request(BASE_URL)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test-bcrypt@example.com',
        password: 'MyPassword123',
      });

    const user = await prisma.user.findUnique({
      where: { email: 'test-bcrypt@example.com' },
    });

    expect(user?.passwordHash).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    expect(user?.passwordHash).not.toBe('MyPassword123'); // Not plaintext
  });
});
```

**`tests/integration/api/payments/verify.test.ts`**
```typescript
import request from 'supertest';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

describe('POST /api/payments/verify', () => {
  let testUser: any;
  let testProperty: any;
  let testBooking: any;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test Tenant',
        email: 'tenant-verify@example.com',
        passwordHash: 'hashed',
        role: 'TENANT',
      },
    });

    // Create test property
    const owner = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: 'owner-verify@example.com',
        passwordHash: 'hashed',
        role: 'OWNER',
        isApproved: true,
      },
    });

    testProperty = await prisma.property.create({
      data: {
        ownerId: owner.id,
        name: 'Test PG',
        description: 'Test',
        city: 'Mumbai',
        address: 'Test Address',
        isVerified: true,
      },
    });

    // Create test booking
    testBooking = await prisma.booking.create({
      data: {
        tenantId: testUser.id,
        propertyId: testProperty.id,
        type: 'DIRECT',
        status: 'PENDING',
        tokenAmount: 500,
        razorpayOrderId: 'order_test123',
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { endsWith: '-verify@example.com' } },
    });
  });

  it('should verify valid Razorpay payment', async () => {
    // Generate valid signature
    const body = `${testBooking.razorpayOrderId}|payment_test123`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    const response = await request(BASE_URL)
      .post('/api/payments/verify')
      .set('Cookie', `next-auth.session-token=${testUser.sessionToken}`) // Mock session
      .send({
        bookingId: testBooking.id,
        razorpay_order_id: testBooking.razorpayOrderId,
        razorpay_payment_id: 'payment_test123',
        razorpay_signature: signature,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify booking updated
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: testBooking.id },
    });
    expect(updatedBooking?.status).toBe('CONFIRMED');
    expect(updatedBooking?.tokenPaid).toBe(true);
  });

  it('should reject invalid signature', async () => {
    const response = await request(BASE_URL)
      .post('/api/payments/verify')
      .set('Cookie', `next-auth.session-token=${testUser.sessionToken}`)
      .send({
        bookingId: testBooking.id,
        razorpay_order_id: testBooking.razorpayOrderId,
        razorpay_payment_id: 'payment_fake',
        razorpay_signature: 'invalid_signature',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid payment signature');
  });

  it('should prevent cross-user payment verification', async () => {
    // Create another user
    const otherUser = await prisma.user.create({
      data: {
        name: 'Other User',
        email: 'other-user@example.com',
        passwordHash: 'hashed',
        role: 'TENANT',
      },
    });

    const response = await request(BASE_URL)
      .post('/api/payments/verify')
      .set('Cookie', `next-auth.session-token=${otherUser.sessionToken}`)
      .send({
        bookingId: testBooking.id, // Booking belongs to testUser, not otherUser
        razorpay_order_id: testBooking.razorpayOrderId,
        razorpay_payment_id: 'payment_test',
        razorpay_signature: 'valid_signature',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Unauthorized');
  });
});
```

---

## 🌐 End-to-End Tests

**`tests/e2e/booking-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test('Tenant can search, view, and book a PG', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Gharam/);

    // 2. Search for PG in Mumbai
    await page.fill('[placeholder="Search city"]', 'Mumbai');
    await page.click('button:has-text("Search")');

    // 3. View search results
    await expect(page.locator('.property-card')).toHaveCount({ min: 1 });
    
    // 4. Click first property
    await page.locator('.property-card').first().click();
    await expect(page).toHaveURL(/\/listings\/\w+/);

    // 5. Verify property details loaded
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="book-now-btn"]')).toBeVisible();

    // 6. Click "Book Now"
    await page.click('[data-testid="book-now-btn"]');

    // 7. Fill booking form
    await page.fill('[name="name"]', 'Test Tenant');
    await page.fill('[name="phone"]', '9876543210');
    await page.fill('[name="email"]', 'tenant@example.com');
    await page.fill('[name="message"]', 'I would like to book this PG');

    // 8. Submit booking
    await page.click('button:has-text("Pay Token Amount")');

    // 9. Razorpay modal should open
    await expect(page.frameLocator('iframe[name="razorpay-checkout"]')).toBeVisible();
    
    // Note: Can't automate actual payment in test environment
    // In production tests, use Razorpay test card: 4111 1111 1111 1111
  });

  test('Property details page shows all amenities', async ({ page }) => {
    await page.goto('/listings/test-property-id');

    await expect(page.locator('text=WiFi')).toBeVisible();
    await expect(page.locator('text=AC')).toBeVisible();
    await expect(page.locator('text=Parking')).toBeVisible();
  });

  test('Guest cannot access owner dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Authentication Flow', () => {
  test('User can sign up and log in', async ({ page }) => {
    // 1. Navigate to signup
    await page.goto('/auth/signup');

    // 2. Fill signup form
    const randomEmail = `test-${Date.now()}@example.com`;
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', randomEmail);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="phone"]', '9876543210');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(auth\/login|dashboard)/);

    // 5. Log in with new account
    if (page.url().includes('login')) {
      await page.fill('[name="email"]', randomEmail);
      await page.fill('[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');
    }

    // 6. Should see dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('Password reset flow works end-to-end', async ({ page }) => {
    // 1. Go to forgot password page
    await page.goto('/auth/forgot-password');

    // 2. Enter email
    await page.fill('[name="email"]', 'existing@example.com');
    await page.click('button[type="submit"]');

    // 3. Should show success message
    await expect(page.locator('text=Check Your Email')).toBeVisible();

    // Note: In automated tests, you'd need to:
    // - Mock email service or use test email inbox
    // - Extract reset link from email
    // - Navigate to reset page with token
    // - Complete password reset
  });
});
```

---

## 🔒 Security Tests

**`tests/security/vulnerabilities.test.ts`**
```typescript
import request from 'supertest';

const BASE_URL = 'http://localhost:3000';

describe('Security Vulnerability Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should sanitize city search input', async () => {
      const malicious = "Mumbai'; DROP TABLE users; --";
      
      const response = await request(BASE_URL)
        .get(`/api/properties?city=${encodeURIComponent(malicious)}`);

      expect(response.status).toBe(200);
      // Should not crash or return error about invalid SQL
    });
  });

  describe('XSS Protection', () => {
    it('should escape HTML in property descriptions', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      // Attempt to create property with XSS payload
      const response = await request(BASE_URL)
        .post('/api/properties')
        .send({
          name: 'Test PG',
          description: xssPayload,
          // ... other fields
        });

      // Retrieve property
      const getResponse = await request(BASE_URL)
        .get(`/api/properties/${response.body.id}`);

      expect(getResponse.body.description).not.toContain('<script>');
    });
  });

  describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
      const response = await request(BASE_URL)
        .post('/api/bookings')
        .send({ propertyId: 'test' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce login rate limits', async () => {
      const promises = Array(15).fill(null).map(() =>
        request(BASE_URL)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' })
      );

      const results = await Promise.all(promises);
      const rateLimited = results.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Authorization', () => {
    it('should prevent unauthorized property deletion', async () => {
      // User A creates property
      const createResponse = await request(BASE_URL)
        .post('/api/properties')
        .set('Cookie', 'session=userA')
        .send({ name: 'Test PG', /* ... */ });

      // User B tries to delete User A's property
      const deleteResponse = await request(BASE_URL)
        .delete(`/api/properties/${createResponse.body.id}`)
        .set('Cookie', 'session=userB');

      expect(deleteResponse.status).toBe(403);
    });
  });
});
```

---

## 📊 Performance Tests

**`tests/performance/load-test.js`** (k6 script)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Sustain 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% error rate
  },
};

export default function () {
  // Test homepage
  let res = http.get('http://localhost:3000');
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Test search API
  res = http.get('http://localhost:3000/api/properties?city=Mumbai');
  check(res, {
    'search API status 200': (r) => r.status === 200,
    'search API fast': (r) => r.timings.duration < 200,
    'returns properties': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(2);

  // Test property details
  const properties = JSON.parse(res.body);
  if (properties.length > 0) {
    res = http.get(`http://localhost:3000/api/properties/${properties[0].id}`);
    check(res, {
      'property details status 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
```

**Run performance tests:**
```bash
k6 run tests/performance/load-test.js
```

---

## ✅ Manual Testing Checklist

### Pre-Deployment Checklist

**Security Verification**
- [ ] All environment variables validated on startup
- [ ] CSRF tokens generated and validated correctly
- [ ] Rate limiting blocks after threshold exceeded
- [ ] Password reset tokens expire after 1 hour
- [ ] Session expires after 24 hours
- [ ] Bcrypt uses 14 rounds for password hashing
- [ ] Payment signature verification works correctly
- [ ] User enumeration prevention on forgot password
- [ ] SQL injection attempts return sanitized results
- [ ] XSS payloads are escaped in all user inputs

**Functional Testing**
- [ ] User signup with email verification
- [ ] User login with correct credentials
- [ ] User login fails with incorrect credentials
- [ ] Password reset flow (request + reset + login)
- [ ] Property listing creation (owner role)
- [ ] Property listing approval (admin role)
- [ ] Property search by city
- [ ] Property filtering (gender, price, amenities)
- [ ] Token booking with Razorpay payment
- [ ] Booking enquiry submission
- [ ] WhatsApp enquiry link generation
- [ ] User profile update
- [ ] Account deletion with booking checks
- [ ] Image upload with dimension validation
- [ ] Owner dashboard displays properties
- [ ] Admin dashboard displays pending approvals

**Browser Compatibility**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Accessibility**
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels present
- [ ] Contrast ratio meets WCAG AA
- [ ] Form error messages announced

---

## 🚀 CI/CD Integration

**`.github/workflows/test.yml`**
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
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
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:security": "npm run test -- tests/security",
    "test:performance": "k6 run tests/performance/load-test.js"
  }
}
```

---

## 📝 Test Coverage Goals

### Minimum Coverage Targets
- **Overall:** 70% line coverage
- **Critical paths:** 90% coverage
  - Authentication (login, signup, password reset)
  - Payment verification
  - Rate limiting
  - CSRF protection
- **API routes:** 80% coverage
- **Security utilities:** 95% coverage

### Priority Testing Order
1. **Security** → Critical vulnerabilities must have tests
2. **Payments** → Money flows must be bulletproof
3. **Authentication** → User identity is sacred
4. **Core Booking Flow** → Primary business logic
5. **Admin Features** → Lower traffic but important
6. **UI Components** → Visual regression testing

---

## 🎯 Success Metrics

- ✅ All security vulnerability tests pass
- ✅ Payment verification tests pass 100%
- ✅ Rate limiting works under load
- ✅ E2E booking flow completes without errors
- ✅ Performance tests meet SLA (<500ms p95)
- ✅ CI/CD pipeline green on all branches
- ✅ Test coverage >70% overall

---

**Testing is not a phase, it's a continuous practice.** 🧪

Let's build confidence in code, one test at a time! 🚀
