import { Page } from "@playwright/test";
import { prisma } from "@/lib/prisma";

/**
 * Test helper utilities for E2E tests
 */

export const TEST_USERS = {
  tenant: {
    email: "e2e-tenant@pglife.test",
    password: "TestPass123!",
    name: "E2E Tenant",
    phone: "9876543210",
    role: "TENANT",
  },
  owner: {
    email: "e2e-owner@pglife.test",
    password: "TestPass123!",
    name: "E2E Owner",
    phone: "9876543211",
    role: "OWNER",
  },
  admin: {
    email: "e2e-admin@pglife.test",
    password: "TestPass123!",
    name: "E2E Admin",
    phone: "9876543212",
    role: "ADMIN",
  },
};

/**
 * Clean up all test data from database
 * Simplified version that avoids nested queries
 */
export async function cleanupTestData() {
  try {
    // Simple approach: just delete users with test emails
    // Cascade deletes will handle related records
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: "@pglife.test" } },
          { email: { contains: "e2e-" } },
        ],
      },
    });
  } catch (error) {
    // Silently ignore errors - tests can continue
  }
}

/**
 * Login helper that waits for actual navigation
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string,
  expectedUrl = "/dashboard"
) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation with shorter timeout
  await page.waitForURL(new RegExp(expectedUrl), { timeout: 10000 });
}

/**
 * Fast navigation without networkidle wait
 */
export async function fastGoto(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
}
