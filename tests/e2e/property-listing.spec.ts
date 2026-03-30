import { test, expect, Page } from '@playwright/test';

// Page Object Model for Property Listing
class PropertyListingPage {
  constructor(public page: Page) {}

  async navigateToNewListing() {
    await this.page.goto('/owner/listings/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fillBasicInfo(data: {
    name: string;
    description: string;
    city: string;
    address: string;
    gender: 'MALE' | 'FEMALE' | 'UNISEX';
    whatsapp?: string;
    lat?: number;
    lng?: number;
  }) {
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('textarea[name="description"]', data.description);
    await this.page.fill('input[name="city"]', data.city);
    await this.page.fill('input[name="address"]', data.address);
    await this.page.selectOption('select[name="gender"]', data.gender);
    
    if (data.whatsapp) {
      await this.page.fill('input[name="whatsapp"]', data.whatsapp);
    }
    
    if (data.lat !== undefined) {
      await this.page.fill('input[name="lat"]', data.lat.toString());
    }
    
    if (data.lng !== undefined) {
      await this.page.fill('input[name="lng"]', data.lng.toString());
    }
  }

  async addRoom(data: {
    type: 'Single' | 'Double' | 'Triple';
    rent: number;
    deposit: number;
  }) {
    await this.page.click('button:has-text("Add Room")');
    
    // Fill room form (assuming modal or inline form)
    await this.page.selectOption('select[name="roomType"]', data.type);
    await this.page.fill('input[name="rent"]', data.rent.toString());
    await this.page.fill('input[name="deposit"]', data.deposit.toString());
    
    await this.page.click('button:has-text("Save Room")');
  }

  async selectAmenities(amenities: string[]) {
    for (const amenity of amenities) {
      await this.page.check(`input[type="checkbox"][value="${amenity}"]`);
    }
  }

  async uploadImages(filePaths: string[]) {
    const fileInput = this.page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles(filePaths);
  }

  async clickNext() {
    await this.page.click('button:has-text("Next")');
  }

  async submitListing() {
    await this.page.click('button:has-text("Submit"), button:has-text("Create Listing")');
  }

  async waitForSuccess() {
    await expect(this.page.locator('text=/success|created/i')).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Property Listing Creation', () => {
  let propertyPage: PropertyListingPage;
  
  test.beforeEach(async ({ page }) => {
    propertyPage = new PropertyListingPage(page);
    
    // Login as approved owner first
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/owner/dashboard');
  });

  test('should create complete property listing', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    // Step 1: Basic Information
    await propertyPage.fillBasicInfo({
      name: 'Sunshine PG for Boys',
      description: 'Comfortable PG with all modern amenities near metro station',
      city: 'Delhi',
      address: '123 MG Road, Connaught Place, New Delhi',
      gender: 'MALE',
      whatsapp: '9876543210',
      lat: 28.6139,
      lng: 77.2090,
    });

    await propertyPage.clickNext();

    // Step 2: Rooms
    await propertyPage.addRoom({
      type: 'Single',
      rent: 8000,
      deposit: 16000,
    });

    await propertyPage.addRoom({
      type: 'Double',
      rent: 6000,
      deposit: 12000,
    });

    await propertyPage.clickNext();

    // Step 3: Amenities
    await propertyPage.selectAmenities(['WiFi', 'AC', 'Parking', 'CCTV']);

    await propertyPage.clickNext();

    // Step 4: Images (mock file upload)
    // Note: In real tests, you'd need actual test images
    // await propertyPage.uploadImages(['tests/fixtures/room1.jpg', 'tests/fixtures/room2.jpg']);

    // Step 5: Submit
    await propertyPage.submitListing();

    // Verify success
    await propertyPage.waitForSuccess();

    // Should redirect to owner dashboard
    await page.waitForURL('/owner/dashboard', { timeout: 10000 });

    // Verify listing appears in dashboard with "Pending" status
    await expect(page.locator('text=Sunshine PG for Boys')).toBeVisible();
    await expect(page.locator('text=/pending/i')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    // Try to submit without filling anything
    await propertyPage.submitListing();

    // Should show validation errors
    await expect(page.locator('text=/required|must be/i')).toBeVisible();
  });

  test('should validate rent minimum', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await propertyPage.fillBasicInfo({
      name: 'Test PG',
      description: 'Test',
      city: 'Delhi',
      address: '123 Test Street',
      gender: 'UNISEX',
    });

    await propertyPage.clickNext();

    // Try to add room with rent below minimum (₹500)
    await page.click('button:has-text("Add Room")');
    await page.selectOption('select[name="roomType"]', 'Single');
    await page.fill('input[name="rent"]', '300'); // Below minimum
    await page.fill('input[name="deposit"]', '1000');
    await page.click('button:has-text("Save Room")');

    // Should show validation error
    await expect(page.locator('text=/min.*rent.*500/i')).toBeVisible();
  });

  test('should validate coordinate ranges', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await page.fill('input[name="name"]', 'Test PG');
    await page.fill('input[name="city"]', 'Delhi');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.selectOption('select[name="gender"]', 'MALE');
    
    // Invalid latitude
    await page.fill('input[name="lat"]', '100'); // Should be -90 to 90
    await page.fill('input[name="lng"]', '77');

    await propertyPage.clickNext();

    // Should show validation error
    await expect(page.locator('text=/invalid.*coordinate|latitude/i')).toBeVisible();
  });

  test('should save draft and resume later', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    // Fill partial information
    await propertyPage.fillBasicInfo({
      name: 'Draft PG',
      description: 'This is a draft',
      city: 'Mumbai',
      address: '456 Test Road',
      gender: 'FEMALE',
    });

    // Click "Save Draft" button
    await page.click('button:has-text("Save Draft")');

    // Should save and redirect
    await page.waitForURL('/owner/dashboard');
    await expect(page.locator('text=Draft PG')).toBeVisible();
    await expect(page.locator('text=/draft/i')).toBeVisible();

    // Resume editing
    await page.click('text=Draft PG');
    await page.click('button:has-text("Edit"), a:has-text("Edit")');

    // Should pre-fill with saved data
    await expect(page.locator('input[name="name"]')).toHaveValue('Draft PG');
    await expect(page.locator('input[name="city"]')).toHaveValue('Mumbai');
  });

  test('should prevent listing creation for unapproved owner', async ({ page }) => {
    // Logout and login as unapproved owner
    await page.click('button:has-text("Logout")');
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'unapproved@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to pending page
    await page.waitForURL('/auth/pending');

    // Try to navigate directly
    await page.goto('/owner/listings/new');

    // Should redirect back to pending or show error
    await expect(page).toHaveURL('/auth/pending');
  });

  test('should show listing preview before submit', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await propertyPage.fillBasicInfo({
      name: 'Preview Test PG',
      description: 'Preview description',
      city: 'Bangalore',
      address: '789 Preview Street',
      gender: 'UNISEX',
    });

    // Navigate through steps
    await propertyPage.clickNext(); // Rooms
    await propertyPage.clickNext(); // Amenities
    await propertyPage.clickNext(); // Images

    // Should show preview/review step
    await expect(page.locator('text=/preview|review/i')).toBeVisible();
    await expect(page.locator('text=Preview Test PG')).toBeVisible();
    await expect(page.locator('text=Preview description')).toBeVisible();
  });

  test('should validate WhatsApp number format', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await page.fill('input[name="name"]', 'Test PG');
    await page.fill('input[name="city"]', 'Delhi');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.selectOption('select[name="gender"]', 'MALE');
    
    // Invalid WhatsApp (should be 10 digits)
    await page.fill('input[name="whatsapp"]', '12345');

    await propertyPage.clickNext();

    // Should show validation error
    await expect(page.locator('text=/invalid.*whatsapp|10.*digit/i')).toBeVisible();
  });

  test('should limit description length', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    const longDescription = 'A'.repeat(2500); // Over 2000 char limit

    await page.fill('input[name="name"]', 'Test PG');
    await page.fill('input[name="city"]', 'Delhi');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('textarea[name="description"]', longDescription);
    await page.selectOption('select[name="gender"]', 'MALE');

    await propertyPage.clickNext();

    // Should show validation error
    await expect(page.locator('text=/maximum|too long|2000/i')).toBeVisible();
  });

  test('should allow editing existing listing', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/owner/dashboard');

    // Click on existing listing
    await page.click('text=Sunshine PG for Boys');

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Modify name
    await page.fill('input[name="name"]', 'Sunshine PG Updated');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify update
    await expect(page.locator('text=Sunshine PG Updated')).toBeVisible();
    await expect(page.locator('text=/updated|saved/i')).toBeVisible();
  });

  test('should calculate monthly rent correctly', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await propertyPage.fillBasicInfo({
      name: 'Rent Test PG',
      description: 'Test',
      city: 'Delhi',
      address: '123 Test',
      gender: 'MALE',
    });

    await propertyPage.clickNext();

    // Add room with specific rent
    await propertyPage.addRoom({
      type: 'Single',
      rent: 7500,
      deposit: 15000,
    });

    // Should display rent correctly
    await expect(page.locator('text=/₹.*7,500|7500/i')).toBeVisible();
  });

  test('should select food plan options', async ({ page }) => {
    await propertyPage.navigateToNewListing();

    await page.fill('input[name="name"]', 'Food Plan Test PG');
    await page.fill('input[name="city"]', 'Delhi');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.selectOption('select[name="gender"]', 'MALE');
    
    // Select food plan
    await page.selectOption('select[name="foodPlan"]', 'TWO_MEALS');

    await propertyPage.clickNext();

    // Should proceed without error
    await expect(page).not.toHaveURL('/owner/listings/new'); // Moved to next step
  });
});

test.describe('Property Listing - Multi-step Form Navigation', () => {
  test('should navigate back through steps', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/owner/dashboard');

    await page.goto('/owner/listings/new');

    // Fill step 1
    await page.fill('input[name="name"]', 'Nav Test PG');
    await page.fill('input[name="city"]', 'Delhi');
    await page.fill('input[name="address"]', '123 Test');
    await page.selectOption('select[name="gender"]', 'MALE');
    await page.click('button:has-text("Next")');

    // On step 2, go back
    await page.click('button:has-text("Back"), button:has-text("Previous")');

    // Should be back on step 1 with data preserved
    await expect(page.locator('input[name="name"]')).toHaveValue('Nav Test PG');
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'owner@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/owner/dashboard');

    await page.goto('/owner/listings/new');

    // Should show step indicator (1/5, 2/5, etc.)
    const stepIndicator = page.locator('text=/step.*[1-5]|[1-5].*of.*5/i');
    await expect(stepIndicator).toBeVisible();
  });
});
