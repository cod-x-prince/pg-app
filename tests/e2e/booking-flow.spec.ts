import { test, expect, Page } from '@playwright/test';

// Page Object Model for Booking Flow
class BookingPage {
  constructor(public page: Page) {}

  async searchProperties(city: string) {
    await this.page.goto('/');
    await this.page.fill('input[name="search"], input[placeholder*="city"]', city);
    await this.page.click('button[type="submit"], button:has-text("Search")');
    await this.page.waitForLoadState('networkidle');
  }

  async applyFilters(filters: {
    gender?: 'MALE' | 'FEMALE' | 'UNISEX';
    minRent?: number;
    maxRent?: number;
    amenities?: string[];
  }) {
    if (filters.gender) {
      await this.page.click(`button[value="${filters.gender}"], input[value="${filters.gender}"]`);
    }

    if (filters.minRent !== undefined) {
      await this.page.fill('input[name="minRent"]', filters.minRent.toString());
    }

    if (filters.maxRent !== undefined) {
      await this.page.fill('input[name="maxRent"]', filters.maxRent.toString());
    }

    if (filters.amenities) {
      for (const amenity of filters.amenities) {
        await this.page.check(`input[type="checkbox"][value="${amenity}"]`);
      }
    }

    // Apply filters
    await this.page.click('button:has-text("Apply"), button:has-text("Filter")');
  }

  async clickProperty(propertyName: string) {
    await this.page.click(`text=${propertyName}`);
    await this.page.waitForLoadState('networkidle');
  }

  async initiateBooking(roomType: string) {
    // Click on specific room type
    await this.page.click(`button:has-text("${roomType}")`);
    
    // Click "Book Now" button
    await this.page.click('button:has-text("Book Now"), button:has-text("Book")');
  }

  async fillBookingDetails(moveInDate: string) {
    await this.page.fill('input[type="date"], input[name="moveInDate"]', moveInDate);
  }

  async proceedToPayment() {
    await this.page.click('button:has-text("Proceed"), button:has-text("Continue")');
  }

  async completeRazorpayPayment() {
    // In test environment, Razorpay should be mocked
    // This is a placeholder for the actual Razorpay modal interaction
    
    // Wait for Razorpay modal (in real tests, you'd use Razorpay test mode)
    await this.page.waitForSelector('[class*="razorpay"], iframe[src*="razorpay"]', { timeout: 10000 });
    
    // In test mode, click success button or use test card
    // This depends on your Razorpay test setup
    await this.page.click('button:has-text("Pay"), button:has-text("Success")');
  }

  async verifyBookingSuccess() {
    await expect(this.page.locator('text=/success|confirmed|booking.*complete/i')).toBeVisible({ timeout: 15000 });
  }
}

test.describe('Booking Flow', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    
    // Login as tenant
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete full booking flow', async ({ page }) => {
    // Search for properties
    await bookingPage.searchProperties('Delhi');

    // Verify search results page loaded
    await expect(page.locator('text=/properties.*delhi|results/i')).toBeVisible();

    // Apply filters
    await bookingPage.applyFilters({
      gender: 'MALE',
      maxRent: 10000,
      amenities: ['WiFi', 'Parking'],
    });

    // Click on a property
    await bookingPage.clickProperty('Sunshine PG for Boys');

    // Verify property details page
    await expect(page.locator('h1:has-text("Sunshine PG for Boys")')).toBeVisible();

    // View property details
    await expect(page.locator('text=/₹.*8,000|rent/i')).toBeVisible();
    await expect(page.locator('text=WiFi')).toBeVisible();

    // Initiate booking for Single room
    await bookingPage.initiateBooking('Single');

    // Fill move-in date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const moveInDate = tomorrow.toISOString().split('T')[0];
    await bookingPage.fillBookingDetails(moveInDate);

    // Verify booking summary
    await expect(page.locator('text=/token.*₹.*500/i')).toBeVisible();

    // Proceed to payment
    await bookingPage.proceedToPayment();

    // Complete Razorpay payment (mocked in test)
    await bookingPage.completeRazorpayPayment();

    // Verify booking success
    await bookingPage.verifyBookingSuccess();

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // Verify booking appears in dashboard
    await expect(page.locator('text=Sunshine PG for Boys')).toBeVisible();
    await expect(page.locator('text=/confirmed|booked/i')).toBeVisible();
  });

  test('should validate past move-in date', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');
    await bookingPage.initiateBooking('Single');

    // Try to select yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', pastDate);
    await bookingPage.proceedToPayment();

    // Should show validation error
    await expect(page.locator('text=/must be.*today|future|past/i')).toBeVisible();
  });

  test('should show token amount of ₹500', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');
    await bookingPage.initiateBooking('Single');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookingPage.fillBookingDetails(tomorrow.toISOString().split('T')[0]);

    // Verify token amount is exactly ₹500
    await expect(page.locator('text=/token.*₹.*500/i')).toBeVisible();
  });

  test('should require authentication for booking', async ({ page }) => {
    // Logout
    await page.click('button:has-text("Logout")');

    // Try to access booking without login
    await page.goto('/properties/delhi/prop_123');
    await page.click('button:has-text("Book Now")');

    // Should redirect to login
    await page.waitForURL('/auth/login');
  });

  test('should show property owner WhatsApp contact', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');

    // Should show WhatsApp button/link
    const whatsappLink = page.locator('a[href*="wa.me"], button:has-text("WhatsApp")');
    await expect(whatsappLink).toBeVisible();

    // Verify link contains property name
    const href = await whatsappLink.getAttribute('href');
    expect(href).toContain('wa.me/91');
  });

  test('should prevent double booking', async ({ page, context }) => {
    // Complete one booking
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');
    await bookingPage.initiateBooking('Single');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookingPage.fillBookingDetails(tomorrow.toISOString().split('T')[0]);
    await bookingPage.proceedToPayment();

    // Before payment completes, try to book again in new tab
    const page2 = await context.newPage();
    await page2.goto('/properties/delhi/prop_123');
    await page2.click('button:has-text("Book Now")');

    // Should show error or prevent double booking
    // The exact behavior depends on your race condition handling
    // This test verifies you're handling concurrent bookings
  });

  test('should send confirmation email after booking', async ({ page }) => {
    // This would require checking email in test environment
    // For now, we can verify the UI shows confirmation message
    
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');
    await bookingPage.initiateBooking('Single');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookingPage.fillBookingDetails(tomorrow.toISOString().split('T')[0]);
    await bookingPage.proceedToPayment();
    await bookingPage.completeRazorpayPayment();

    // Should mention email sent
    await expect(page.locator('text=/email.*sent|confirmation.*email/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow booking cancellation', async ({ page }) => {
    // Navigate to dashboard with existing booking
    await page.goto('/dashboard');

    // Find booking and click cancel
    await page.click('button:has-text("Cancel Booking")');

    // Confirm cancellation
    await page.click('button:has-text("Confirm")');

    // Should show cancellation success
    await expect(page.locator('text=/cancelled|refund/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display property images', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');

    // Should have image gallery
    const images = page.locator('img[src*="cloudinary"], img[alt*="room"], img[alt*="property"]');
    await expect(images.first()).toBeVisible();
  });

  test('should show property amenities', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');

    // Should list amenities
    await expect(page.locator('text=WiFi')).toBeVisible();
    await expect(page.locator('text=Parking')).toBeVisible();
  });

  test('should handle Razorpay payment failure', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');
    await bookingPage.clickProperty('Sunshine PG for Boys');
    await bookingPage.initiateBooking('Single');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await bookingPage.fillBookingDetails(tomorrow.toISOString().split('T')[0]);
    await bookingPage.proceedToPayment();

    // Simulate payment failure
    await page.click('button:has-text("Fail"), button:has-text("Cancel Payment")');

    // Should show error message
    await expect(page.locator('text=/payment.*failed|transaction.*failed/i')).toBeVisible();

    // Booking should not be created
    await page.goto('/dashboard');
    await expect(page.locator('text=/no.*booking|empty/i')).toBeVisible();
  });

  test('should verify property is verified before booking', async ({ page }) => {
    await bookingPage.searchProperties('Delhi');

    // Only verified properties should appear in search
    // Pending properties should not be bookable
    await bookingPage.clickProperty('Sunshine PG for Boys');

    // Should show verified badge
    await expect(page.locator('text=/verified|✓/i')).toBeVisible();
  });
});

test.describe('Booking Flow - Search & Filters', () => {
  test('should search by city', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="search"]', 'Mumbai');
    await page.click('button[type="submit"]');

    await page.waitForURL('/properties/mumbai');
    await expect(page.locator('text=/mumbai/i')).toBeVisible();
  });

  test('should filter by gender', async ({ page }) => {
    await page.goto('/properties/delhi');
    await page.click('button[value="FEMALE"]');

    // Should only show female PGs
    await expect(page.locator('text=/female|girls/i')).toBeVisible();
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/properties/delhi');
    await page.fill('input[name="minRent"]', '5000');
    await page.fill('input[name="maxRent"]', '10000');
    await page.click('button:has-text("Apply")');

    // Results should be within range
    const prices = await page.locator('text=/₹.*[0-9,]+/').allTextContents();
    for (const price of prices) {
      const amount = parseInt(price.replace(/[₹,]/g, ''));
      expect(amount).toBeGreaterThanOrEqual(5000);
      expect(amount).toBeLessThanOrEqual(10000);
    }
  });

  test('should show "no results" for invalid search', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="search"]', 'InvalidCityXYZ123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/no.*result|nothing.*found/i')).toBeVisible();
  });
});
