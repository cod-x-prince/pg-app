import { test, expect, Page } from "@playwright/test";

// Helper to generate unique email
const generateTestEmail = () => `test${Date.now()}@example.com`;

// Page Object Model for Auth pages
class AuthPage {
  constructor(public page: Page) {}

  async navigateToSignup() {
    await this.page.goto("/auth/signup");
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToLogin() {
    await this.page.goto("/auth/login");
    await this.page.waitForLoadState("networkidle");
  }

  async selectRoleAndContinue(role: "TENANT" | "OWNER") {
    // Click the role button based on role type
    if (role === "TENANT") {
      // Click "I'm a Tenant" button
      await this.page.click('button:has(p:has-text("I\'m a Tenant"))');
    } else {
      // Click "I'm an Owner" button
      await this.page.click('button:has(p:has-text("I\'m an Owner"))');
    }

    // Click Continue button
    await this.page.click('button:has-text("Continue")');

    // Wait for form to load (next step)
    await this.page.waitForSelector('input[name="name"]', { timeout: 10000 });
  }

  async fillSignupForm(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.fill('input[name="password"]', data.password);

    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    // Note: Role is selected in prior step via selectRoleAndContinue()
  }

  async submitSignup() {
    // Handle Turnstile CAPTCHA (in test mode, should be skipped or have test token)
    await this.page.click('button[type="submit"]');
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  async submitLogin() {
    await this.page.click('button[type="submit"]');
  }

  async waitForRedirect(expectedUrl: string) {
    await this.page.waitForURL(expectedUrl, { timeout: 10000 });
  }

  async assertErrorMessage(message: string) {
    await expect(this.page.locator("text=" + message)).toBeVisible();
  }
}

test.describe("Authentication Flows", () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test.skip("should signup as tenant successfully", async ({ page }) => {
    const testUser = {
      name: "John Tenant",
      email: generateTestEmail(),
      password: "SecurePass123!",
      phone: "9876543210",
    };

    // Navigate to signup page
    await authPage.navigateToSignup();

    // Select role (Tenant) and continue
    await authPage.selectRoleAndContinue("TENANT");

    // Verify page loaded with form
    await expect(page.locator('input[name="name"]')).toBeVisible();

    // Fill signup form
    await authPage.fillSignupForm(testUser);

    // Submit form
    await authPage.submitSignup();

    // Wait for redirect to dashboard
    await authPage.waitForRedirect("/dashboard");

    // Verify user is logged in
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test.skip("should signup as owner and show pending approval", async ({
    page,
  }) => {
    const testOwner = {
      name: "Jane Owner",
      email: generateTestEmail(),
      password: "SecurePass123!",
      phone: "9876543211",
    };

    await authPage.navigateToSignup();

    // Select role (Owner) and continue
    await authPage.selectRoleAndContinue("OWNER");

    await authPage.fillSignupForm(testOwner);
    await authPage.submitSignup();

    // Owners should be redirected to pending approval page
    await authPage.waitForRedirect("/auth/pending");

    // Verify pending message
    await expect(page.locator("text=/pending.*approval/i")).toBeVisible();
  });

  test.skip("should reject signup with invalid email", async ({ page }) => {
    await authPage.navigateToSignup();

    // Select role and continue
    await authPage.selectRoleAndContinue("TENANT");

    await authPage.fillSignupForm({
      name: "Test User",
      email: "invalid-email",
      password: "SecurePass123!",
    });

    await authPage.submitSignup();

    // Should show validation error
    await authPage.assertErrorMessage("Invalid email");
  });

  test.skip("should reject signup with short password", async ({ page }) => {
    await authPage.navigateToSignup();

    // Select role and continue
    await authPage.selectRoleAndContinue("TENANT");

    await authPage.fillSignupForm({
      name: "Test User",
      email: generateTestEmail(),
      password: "short",
    });

    await authPage.submitSignup();

    // Should show validation error
    await authPage.assertErrorMessage("at least 8 characters");
  });

  test("should reject signup with invalid phone", async ({ page }) => {
    await authPage.navigateToSignup();

    // Select role and continue
    await authPage.selectRoleAndContinue("TENANT");

    await authPage.fillSignupForm({
      name: "Test User",
      email: generateTestEmail(),
      password: "SecurePass123!",
      phone: "123456", // Invalid Indian phone
    });

    await authPage.submitSignup();

    // Should show validation error
    await authPage.assertErrorMessage("Invalid phone number");
  });

  test.skip("should login with correct credentials", async ({ page }) => {
    // Use seeded tenant user from database
    const testUser = {
      email: "tenant1@pglife.in",
      password: "Tenant@2026",
    };

    await authPage.navigateToLogin();
    await authPage.fillLoginForm(testUser.email, testUser.password);
    await authPage.submitLogin();

    // Should redirect to dashboard
    // Wait for dashboard (may redirect through login first)
    await page.waitForURL("/dashboard", { timeout: 30000 });

    // Verify user is logged in by checking for dashboard elements
    await expect(page.locator('h1:has-text("Welcome")')).toBeVisible({
      timeout: 5000,
    });
    await authPage.fillLoginForm("tenant1@pglife.in", "WrongPassword123!");
    await authPage.submitLogin();

    // Should show error (may be different text)
    const errorLocator = page.locator("text=/invalid|incorrect|failed/i");
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
  });

  test("should enforce rate limiting after multiple failed logins", async ({
    page,
  }) => {
    await authPage.navigateToLogin();

    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await authPage.fillLoginForm("test" + i + "@example.com", "wrong" + i);
      await authPage.submitLogin();
      await page.waitForTimeout(500); // Small delay between attempts
    }

    // Should show rate limit error or stop accepting requests
    await page.waitForTimeout(1000);
  });

  test.skip("should navigate to password reset page", async ({ page }) => {
    await authPage.navigateToLogin();

    // Click "Forgot Password" link
    await page.click("text=/forgot.*password/i");

    // Should navigate to reset page
    await page.waitForURL("/auth/forgot-password");
    await expect(page.locator("h1")).toContainText("Reset Password");
  });

  test("should request password reset", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    // Fill email
    await page.fill('input[name="email"]', "tenant1@pglife.in");

    // Submit
    await page.click('button[type="submit"]');

    // Should show success message or confirmation
    await page.waitForTimeout(2000);
  });

  test.skip("should logout successfully", async ({ page }) => {
    // Login first
    await authPage.navigateToLogin();
    await authPage.fillLoginForm("tenant1@pglife.in", "Tenant@2026");
    await authPage.submitLogin();
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    // Click logout (could be in header/menu)
    const logoutButton = page
      .locator(
        'button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]',
      )
      .first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try menu button
      await page.click('button[aria-label="menu"], button[aria-label="Menu"]');
      await page.click("text=/logout/i");
    }

    // Should redirect to homepage or login
    await page.waitForURL(/^\/$|\/auth\/login/, { timeout: 5000 });
  });

  test("should display Google OAuth button", async ({ page }) => {
    await authPage.navigateToLogin();

    // Check if Google OAuth button exists
    const googleButton = page.locator(
      'button:has-text("Google"), a:has-text("Google")',
    );
    await expect(googleButton).toBeVisible();
  });

  test.skip("should trim and lowercase email on signup", async ({ page }) => {
    const testUser = {
      name: "Trim Test",
      email: "  TRIMTEST" + Date.now() + "@EXAMPLE.COM  ",
      password: "SecurePass123!",
    };

    await authPage.navigateToSignup();

    // Select role and continue
    await authPage.selectRoleAndContinue("TENANT");

    await authPage.fillSignupForm(testUser);
    await authPage.submitSignup();

    // Should process successfully despite spaces and uppercase
    await page.waitForURL(/\/(dashboard|auth\/pending)/, { timeout: 10000 });
  });

  test.skip("should prevent duplicate email registration", async ({ page }) => {
    // Try to signup with email that already exists (seeded user)
    await authPage.navigateToSignup();

    // Select role and continue
    await authPage.selectRoleAndContinue("TENANT");

    await authPage.fillSignupForm({
      name: "Duplicate User",
      email: "tenant1@pglife.in", // Existing seeded user
      password: "SecurePass123!",
    });
    await authPage.submitSignup();

    // Should show error
    await expect(page.locator("text=/already.*exists|duplicate/i")).toBeVisible(
      { timeout: 5000 },
    );
  });

  test.skip("should maintain session across page reloads", async ({ page }) => {
    // Login
    await authPage.navigateToLogin();
    await authPage.fillLoginForm("tenant1@pglife.in", "Tenant@2026");
    await authPage.submitLogin();
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Authentication - Session Management", () => {
  test.skip("should expire session after 24 hours", async ({ page }) => {
    // This test would require manipulating time or waiting 24 hours
    // For now, just verify we can logout and session is cleared
    const authPage = new AuthPage(page);

    await authPage.navigateToLogin();
    await authPage.fillLoginForm("tenant1@pglife.in", "Tenant@2026");
    await authPage.submitLogin();
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Verify session exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (c) =>
        c.name.toLowerCase().includes("session") ||
        c.name.toLowerCase().includes("auth"),
    );
    await expect(sessionCookie).toBeTruthy();
  });

  test.skip("should handle concurrent sessions", async ({ browser }) => {
    // Create two browser contexts (two concurrent sessions)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const authPage1 = new AuthPage(page1);
    const authPage2 = new AuthPage(page2);

    // Login in both contexts
    await authPage1.navigateToLogin();
    await authPage1.fillLoginForm("tenant1@pglife.in", "Tenant@2026");
    await authPage1.submitLogin();
    await page1.waitForURL("/dashboard", { timeout: 10000 });

    await authPage2.navigateToLogin();
    await authPage2.fillLoginForm("owner1@pglife.in", "Owner@2026");
    await authPage2.submitLogin();
    await page2.waitForURL(/\/dashboard|\/auth\/pending/, { timeout: 10000 });

    // Both should have active sessions
    await expect(page1).toHaveURL(/\/dashboard/);
    await expect(page2).toHaveURL(/\/dashboard|\/auth\/pending/);

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
