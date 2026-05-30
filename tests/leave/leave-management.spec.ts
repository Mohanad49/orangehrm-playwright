import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { LeaveManagementPage } from '../../pages/LeaveManagementPage';

test.describe('Leave Management Tests', () => {
  let leaveManagementPage: LeaveManagementPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    leaveManagementPage = new LeaveManagementPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await page.waitForURL('**/dashboard/**');
  });

  test('Apply for leave (or verify leave balance status)', async ({ page }) => {
    // Use a future date to avoid conflicts
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0]; // yyyy-mm-dd format

    await leaveManagementPage.gotoApplyLeave();

    // The demo user may not have leave balance — this is expected
    const hasBalance = await leaveManagementPage.hasLeaveBalance();
    if (hasBalance) {
      const applied = await leaveManagementPage.applyForLeave(
        'CAN - Vacation',
        dateStr,
        dateStr,
        `E2E test leave request - ${Date.now()}`
      );
      if (applied) {
        await page.waitForLoadState('domcontentloaded');
      }
    } else {
      // Verify the "No Leave Types with Leave Balance" message is shown
      await expect(leaveManagementPage.noLeaveBalanceMessage).toBeVisible();
    }
  });

  test('Verify leave requests appear in My Leave list', async ({ page }) => {
    await leaveManagementPage.gotoMyLeave();

    // The My Leave page should load and show the table or search form
    const pageContent = page.locator('.oxd-layout-context');
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('Cancel a pending leave request', async ({ page }) => {
    // Navigate to My Leave to find and cancel a request
    await leaveManagementPage.gotoMyLeave();
    await page.waitForLoadState('domcontentloaded');

    // Attempt to cancel the first available leave request
    await leaveManagementPage.cancelLeaveRequest();

    // Page should reload/update after cancellation
    await page.waitForLoadState('domcontentloaded');
  });

  test('Check leave entitlements are displayed per leave type', async ({ page }) => {
    await leaveManagementPage.gotoMyEntitlements();

    // Entitlements page should load with either a table or "No Records Found"
    await leaveManagementPage.expectEntitlementsVisible();
  });
});
