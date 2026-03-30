import { test, expect, Page } from '@playwright/test';

// Page Object Model for Profile Management
class ProfilePage {
  constructor(public page: Page) {}

  async navigateToProfile() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    whatsapp?: string;
  }) {
    if (data.name) {
      await this.page.fill('input[name="name"]', data.name);
    }
    
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    
    if (data.whatsapp) {
      await this.page.fill('input[name="whatsapp"]', data.whatsapp);
    }
  }

  async uploadAvatar(filePath: string) {
    await this.page.setInputFiles('input[type="file"][accept*="image"]', filePath);
  }

  async saveProfile() {
    await this.page.click('button:has-text("Save"), button:has-text("Update")');
  }

  async uploadKYCDocument(docType: 'aadhaar' | 'pan', filePath: string) {
    await this.page.click(`text=${docType === 'aadhaar' ? 'Aadhaar' : 'PAN'}`);
    await this.page.setInputFiles(`input[name="${docType}"]`, filePath);
    await this.page.click('button:has-text("Upload")');
  }

  async initiateAccountDeletion() {
    await this.page.click('button:has-text("Delete Account")');
  }

  async confirmAccountDeletion(password: string) {
    await this.page.fill('input[name="password"], input[type="password"]', password);
    await this.page.check('input[type="checkbox"]'); // Confirm checkbox
    await this.page.click('button:has-text("Confirm Delete")');
  }

  async verifySuccess() {
    await expect(this.page.locator('text=/success|updated|saved/i')).toBeVisible({ timeout: 5000 });
  }
}

test.describe('Profile Management', () => {
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    
    // Login as tenant
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should view profile information', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Verify profile page loaded
    await expect(page.locator('h1:has-text("Profile"), h2:has-text("Profile")')).toBeVisible();

    // Should show current user info
    await expect(page.locator('text=/tenant@test.com/i')).toBeVisible();
  });

  test('should update profile name', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Update name
    await profilePage.updateProfile({
      name: 'Updated Name',
    });

    await profilePage.saveProfile();
    await profilePage.verifySuccess();

    // Reload and verify
    await page.reload();
    await expect(page.locator('input[name="name"]')).toHaveValue('Updated Name');
  });

  test('should update phone number', async ({ page }) => {
    await profilePage.navigateToProfile();

    await profilePage.updateProfile({
      phone: '9876543210',
    });

    await profilePage.saveProfile();
    await profilePage.verifySuccess();

    // Verify phone updated
    await page.reload();
    await expect(page.locator('input[name="phone"]')).toHaveValue('9876543210');
  });

  test('should validate phone number format', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Try invalid phone
    await page.fill('input[name="phone"]', '12345');
    await profilePage.saveProfile();

    // Should show validation error
    await expect(page.locator('text=/invalid.*phone|10.*digit/i')).toBeVisible();
  });

  test('should upload avatar image', async ({ page }) => {
    test.skip(); // Skipped - requires actual image file
    
    await profilePage.navigateToProfile();

    // Upload avatar
    await profilePage.uploadAvatar('tests/fixtures/avatar.jpg');

    // Wait for upload
    await expect(page.locator('text=/upload.*success|image.*saved/i')).toBeVisible({ timeout: 10000 });

    // Should show new avatar
    await expect(page.locator('img[alt*="avatar"], img[alt*="profile"]')).toBeVisible();
  });

  test('should upload KYC documents - Aadhaar', async ({ page }) => {
    test.skip(); // Skipped - requires actual document files
    
    await profilePage.navigateToProfile();

    // Navigate to KYC section
    await page.click('text=/kyc|document/i');

    // Upload Aadhaar
    await profilePage.uploadKYCDocument('aadhaar', 'tests/fixtures/aadhaar.jpg');

    // Verify upload success
    await expect(page.locator('text=/aadhaar.*uploaded|upload.*success/i')).toBeVisible({ timeout: 10000 });
  });

  test('should upload KYC documents - PAN', async ({ page }) => {
    test.skip(); // Skipped - requires actual document files
    
    await profilePage.navigateToProfile();
    await page.click('text=/kyc|document/i');

    await profilePage.uploadKYCDocument('pan', 'tests/fixtures/pan.jpg');

    await expect(page.locator('text=/pan.*uploaded|upload.*success/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show KYC verification status', async ({ page }) => {
    await profilePage.navigateToProfile();
    await page.click('text=/kyc|document/i');

    // Should show status (pending, verified, rejected)
    await expect(page.locator('text=/pending|verified|rejected/i')).toBeVisible();
  });

  test('should initiate account deletion', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Scroll to danger zone
    await page.locator('text=/delete.*account|danger.*zone/i').scrollIntoViewIfNeeded();

    // Click delete account
    await profilePage.initiateAccountDeletion();

    // Should show confirmation modal
    await expect(page.locator('text=/are.*you.*sure|confirm.*delete/i')).toBeVisible();
  });

  test('should require password for account deletion', async ({ page }) => {
    await profilePage.navigateToProfile();
    await profilePage.initiateAccountDeletion();

    // Try to delete without password
    await page.click('button:has-text("Confirm Delete")');

    // Should show error
    await expect(page.locator('text=/password.*required|enter.*password/i')).toBeVisible();
  });

  test('should complete account deletion', async ({ page }) => {
    await profilePage.navigateToProfile();
    await profilePage.initiateAccountDeletion();

    // Confirm deletion with password
    await profilePage.confirmAccountDeletion('TestPassword123!');

    // Should redirect to homepage
    await page.waitForURL('/', { timeout: 10000 });

    // Should show deletion success message
    await expect(page.locator('text=/account.*deleted|goodbye/i')).toBeVisible();

    // Try to login again - should fail
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/invalid|not.*found/i')).toBeVisible();
  });

  test('should show bookings history', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Navigate to bookings tab
    await page.click('text=/booking|history/i');

    // Should show list of bookings
    await expect(page.locator('text=/booking.*id|property.*name/i')).toBeVisible();
  });

  test('should show liked properties', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Navigate to favorites/likes
    await page.click('text=/favorite|liked|wishlist/i');

    // Should show liked properties
    await expect(page.locator('text=/favorite|no.*favorite/i')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Navigate to security settings
    await page.click('text=/security|password/i');

    // Fill password change form
    await page.fill('input[name="currentPassword"]', 'TestPassword123!');
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');

    await page.click('button:has-text("Change Password")');

    // Verify success
    await expect(page.locator('text=/password.*changed|password.*updated/i')).toBeVisible({ timeout: 5000 });

    // Logout and login with new password
    await page.click('button:has-text("Logout")');
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.click('button[type="submit"]');

    // Should login successfully
    await page.waitForURL('/dashboard');
  });

  test('should validate new password strength', async ({ page }) => {
    await profilePage.navigateToProfile();
    await page.click('text=/security|password/i');

    await page.fill('input[name="currentPassword"]', 'TestPassword123!');
    await page.fill('input[name="newPassword"]', 'weak'); // Weak password
    await page.fill('input[name="confirmPassword"]', 'weak');

    await page.click('button:has-text("Change Password")');

    // Should show validation error
    await expect(page.locator('text=/at least 8|too weak/i')).toBeVisible();
  });

  test('should require correct current password', async ({ page }) => {
    await profilePage.navigateToProfile();
    await page.click('text=/security|password/i');

    await page.fill('input[name="currentPassword"]', 'WrongPassword');
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');

    await page.click('button:has-text("Change Password")');

    // Should show error
    await expect(page.locator('text=/incorrect.*password|current.*password.*wrong/i')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await profilePage.navigateToProfile();
    await page.click('text=/security|password/i');

    await page.fill('input[name="currentPassword"]', 'TestPassword123!');
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!'); // Mismatch

    await page.click('button:has-text("Change Password")');

    // Should show error
    await expect(page.locator('text=/password.*not.*match|must.*match/i')).toBeVisible();
  });

  test('should view notifications settings', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Navigate to notifications
    await page.click('text=/notification|preference/i');

    // Should show notification toggles
    await expect(page.locator('text=/email.*notification|booking.*alert/i')).toBeVisible();
  });

  test('should toggle email notifications', async ({ page }) => {
    await profilePage.navigateToProfile();
    await page.click('text=/notification|preference/i');

    // Toggle email notifications
    await page.check('input[name="emailNotifications"]');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=/preference.*saved/i')).toBeVisible({ timeout: 5000 });

    // Reload and verify
    await page.reload();
    await page.click('text=/notification|preference/i');
    await expect(page.locator('input[name="emailNotifications"]')).toBeChecked();
  });

  test('should display account creation date', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Should show when account was created
    await expect(page.locator('text=/member.*since|joined/i')).toBeVisible();
  });

  test('should display role badge', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Should show role (TENANT, OWNER, etc.)
    await expect(page.locator('text=/tenant|owner|role/i')).toBeVisible();
  });

  test('should prevent XSS in profile fields', async ({ page }) => {
    await profilePage.navigateToProfile();

    // Try to inject script
    await page.fill('input[name="name"]', '<script>alert("xss")</script>');
    await profilePage.saveProfile();

    // Should be sanitized
    await page.reload();
    const nameValue = await page.locator('input[name="name"]').inputValue();
    expect(nameValue).not.toContain('<script>');
  });
});

test.describe('Profile - Data Privacy (DPDP Act 2023)', () => {
  test('should show data privacy information', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/profile');

    // Should show data privacy link
    await expect(page.locator('text=/privacy.*policy|data.*privacy/i')).toBeVisible();
  });

  test('should export user data', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'tenant@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/profile');

    // Click export data
    await page.click('text=/export.*data|download.*data/i');

    // Should download JSON file with user data
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.(json|zip)$/);
  });
});
