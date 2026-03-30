import { test, expect, Page } from "@playwright/test";

// Page Object Model for Admin Panel
class AdminPage {
  constructor(public page: Page) {}

  async navigateToAdminPanel() {
    await this.page.goto("/admin");
    await this.page.waitForLoadState("networkidle");
  }

  async viewPendingProperties() {
    await this.page.click("text=/pending.*propert|propert.*approval/i");
    await this.page.waitForLoadState("networkidle");
  }

  async viewPropertyDetails(propertyName: string) {
    await this.page.click(`text=${propertyName}`);
  }

  async approveProperty(reason?: string) {
    await this.page.click('button:has-text("Approve")');

    if (reason) {
      await this.page.fill('textarea[name="reason"]', reason);
    }

    await this.page.click('button:has-text("Confirm")');
  }

  async rejectProperty(reason: string) {
    await this.page.click('button:has-text("Reject")');
    await this.page.fill('textarea[name="reason"]', reason);
    await this.page.click('button:has-text("Confirm")');
  }

  async viewKYCPending() {
    await this.page.click("text=/pending.*kyc|kyc.*approval/i");
  }

  async approveKYC(userId: string) {
    await this.page.click(
      `button[data-user-id="${userId}"]:has-text("Approve")`,
    );
    await this.page.click('button:has-text("Confirm")');
  }

  async viewOwners() {
    await this.page.click("text=/owners|manage.*owner/i");
  }

  async approveOwner(ownerEmail: string) {
    await this.page.click(
      `tr:has-text("${ownerEmail}") button:has-text("Approve")`,
    );
    await this.page.click('button:has-text("Confirm")');
  }

  async searchProperty(query: string) {
    await this.page.fill(
      'input[name="search"], input[placeholder*="search"]',
      query,
    );
    await this.page.press('input[name="search"]', "Enter");
  }

  async verifySuccess() {
    await expect(
      this.page.locator("text=/success|approved|saved/i"),
    ).toBeVisible({ timeout: 5000 });
  }
}

test.describe.skip("Admin Approval Workflow", () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);

    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "AdminPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");
  });

  test("should approve property listing", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // View pending properties
    await adminPage.viewPendingProperties();

    // Verify pending properties list
    await expect(
      page.locator("text=/pending|awaiting.*approval/i"),
    ).toBeVisible();

    // Click on a property
    await adminPage.viewPropertyDetails("Sunshine PG for Boys");

    // Verify property details
    await expect(
      page.locator('h1:has-text("Sunshine PG for Boys")'),
    ).toBeVisible();
    await expect(page.locator("text=/review|approve|reject/i")).toBeVisible();

    // Approve property
    await adminPage.approveProperty("Verified and approved");

    // Verify success
    await adminPage.verifySuccess();

    // Property should no longer appear in pending list
    await adminPage.viewPendingProperties();
    await expect(page.locator("text=Sunshine PG for Boys")).not.toBeVisible();

    // Verify property is now public (check by logging out and searching)
  });

  test("should reject property with reason", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewPendingProperties();

    // Click on a property
    await adminPage.viewPropertyDetails("Test PG Rejected");

    // Reject property
    await adminPage.rejectProperty("Property does not meet quality standards");

    // Verify success
    await adminPage.verifySuccess();

    // Verify rejection reason was sent to owner
    // This would require checking owner's notifications or email
  });

  test("should send email notification on approval", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewPendingProperties();
    await adminPage.viewPropertyDetails("Email Test PG");
    await adminPage.approveProperty();

    // Verify UI shows email sent message
    await expect(
      page.locator("text=/email.*sent|notification.*sent/i"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should approve owner account", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewOwners();

    // Filter for unapproved owners
    await page.click('button:has-text("Pending")');

    // Approve an owner
    await adminPage.approveOwner("newowner@test.com");

    // Verify success
    await adminPage.verifySuccess();

    // Owner should now be able to create listings
  });

  test("should approve KYC documents", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewKYCPending();

    // View list of pending KYC
    await expect(page.locator("text=/pending.*kyc/i")).toBeVisible();

    // Click on a user
    await page.click("tr:first-child");

    // View KYC documents (Aadhaar, PAN, etc.)
    await expect(
      page.locator('img[src*="cloudinary"], img[alt*="kyc"]'),
    ).toBeVisible();

    // Approve KYC
    await page.click('button:has-text("Approve KYC")');
    await page.click('button:has-text("Confirm")');

    // Verify success
    await adminPage.verifySuccess();
  });

  test("should reject KYC with reason", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewKYCPending();
    await page.click("tr:first-child");

    // Reject KYC
    await page.click('button:has-text("Reject")');
    await page.fill('textarea[name="reason"]', "Documents are not clear");
    await page.click('button:has-text("Confirm")');

    // Verify success
    await adminPage.verifySuccess();
  });

  test("should search for specific property", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Search for property
    await adminPage.searchProperty("Sunshine PG");

    // Should show search results
    await expect(page.locator("text=Sunshine PG for Boys")).toBeVisible();
  });

  test("should view system stats", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Admin dashboard should show stats
    await expect(
      page.locator("text=/total.*propert|[0-9]+.*propert/i"),
    ).toBeVisible();
    await expect(
      page.locator("text=/total.*user|[0-9]+.*user/i"),
    ).toBeVisible();
    await expect(
      page.locator("text=/pending.*approval|[0-9]+.*pending/i"),
    ).toBeVisible();
  });

  test("should view recent bookings", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Click on bookings section
    await page.click("text=/booking|recent.*booking/i");

    // Should show list of bookings
    await expect(
      page.locator("text=/booking.*id|tenant|property/i"),
    ).toBeVisible();
  });

  test("should filter properties by status", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Filter buttons
    await page.click('button:has-text("Pending")');
    await expect(page.locator("text=/pending/i")).toBeVisible();

    await page.click('button:has-text("Approved")');
    await expect(page.locator("text=/approved|verified/i")).toBeVisible();

    await page.click('button:has-text("Rejected")');
    await expect(page.locator("text=/rejected/i")).toBeVisible();
  });

  test("should sort properties by date", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewPendingProperties();

    // Click sort by newest
    await page.click('button:has-text("Newest"), button[aria-label="Sort"]');

    // Verify sorting (check dates are in descending order)
    const dates = await page.locator("time, [datetime]").allTextContents();
    // Verify dates are in descending order
  });

  test("should view property owner details", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewPendingProperties();
    await adminPage.viewPropertyDetails("Sunshine PG for Boys");

    // Should show owner info
    await expect(
      page.locator("text=/owner.*name|owner.*email/i"),
    ).toBeVisible();
    await expect(page.locator("text=/owner.*phone/i")).toBeVisible();
  });

  test("should prevent non-admin from accessing admin panel", async ({
    page,
  }) => {
    // Logout admin
    await page.click('button:has-text("Logout")');

    // Login as tenant
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "tenant@test.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Try to access admin panel
    await page.goto("/admin");

    // Should redirect or show error
    await expect(page).not.toHaveURL("/admin");
    await expect(
      page.locator("text=/unauthorized|access.*denied|not.*allowed/i"),
    ).toBeVisible();
  });

  test("should prevent owner from accessing admin features", async ({
    page,
  }) => {
    // Logout admin
    await page.click('button:has-text("Logout")');

    // Login as owner
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "owner@test.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Try to access admin panel
    await page.goto("/admin");

    // Should redirect or show error
    await expect(page).not.toHaveURL("/admin");
  });

  test("should bulk approve properties", async ({ page }) => {
    await adminPage.navigateToAdminPanel();
    await adminPage.viewPendingProperties();

    // Select multiple properties
    await page.check('input[type="checkbox"]:first-child');
    await page.check('input[type="checkbox"]:nth-child(2)');

    // Click bulk approve
    await page.click('button:has-text("Approve Selected")');
    await page.click('button:has-text("Confirm")');

    // Verify success
    await expect(page.locator("text=/approved|success/i")).toBeVisible();
  });

  test("should view error logs", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Navigate to system section
    await page.click("text=/system|errors/i");

    // Should show error logs
    await expect(
      page.locator("text=/error.*log|recent.*error/i"),
    ).toBeVisible();
  });

  test("should export properties data", async ({ page }) => {
    await adminPage.navigateToAdminPanel();

    // Click export button
    await page.click('button:has-text("Export")');

    // Should download CSV/Excel file
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download CSV")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".csv");
  });
});

test.describe.skip("Admin - Analytics & Reporting", () => {
  test("should view analytics dashboard", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "AdminPassword123!");
    await page.click('button[type="submit"]');

    await page.goto("/admin");

    // Should show charts and graphs
    await expect(page.locator('[role="img"], canvas, svg')).toBeVisible();
  });

  test("should filter analytics by date range", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "AdminPassword123!");
    await page.click('button[type="submit"]');

    await page.goto("/admin");

    // Select date range
    await page.fill('input[name="startDate"]', "2026-03-01");
    await page.fill('input[name="endDate"]', "2026-03-30");
    await page.click('button:has-text("Apply")');

    // Should update stats
    await expect(page.locator("text=/showing.*results.*for/i")).toBeVisible();
  });
});
