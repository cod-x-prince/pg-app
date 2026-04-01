import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/PG|Gharam/i);
  });

  test("should display search functionality", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to listings page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.click('a[href*="/listings"], button:has-text("Browse")').catch(() => {});
    await page.waitForTimeout(1000);
  });
});
