import { Page, Locator, expect } from '@playwright/test';

export class LeaveManagementPage {
  readonly applyLeaveLink: Locator;
  readonly myLeaveLink: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly commentsInput: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly leaveListTable: Locator;
  readonly tableRows: Locator;
  readonly entitlementsLink: Locator;
  readonly myEntitlementsLink: Locator;
  readonly entitlementTable: Locator;
  readonly headerBreadcrumb: Locator;
  readonly noLeaveBalanceMessage: Locator;

  constructor(private page: Page) {
    this.applyLeaveLink = page.locator('.oxd-topbar-body-nav a', { hasText: 'Apply' });
    this.myLeaveLink = page.locator('.oxd-topbar-body-nav a', { hasText: 'My Leave' });
    this.leaveTypeDropdown = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Leave Type")) .oxd-select-text');
    this.fromDateInput = page.locator('.oxd-grid-item:has(.oxd-label:has-text("From Date")) input');
    this.toDateInput = page.locator('.oxd-grid-item:has(.oxd-label:has-text("To Date")) input');
    this.commentsInput = page.locator('textarea');
    this.applyButton = page.locator('button[type="submit"]');
    this.successToast = page.locator('.oxd-toast--success');
    this.leaveListTable = page.locator('.oxd-table');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-row');
    this.entitlementsLink = page.locator('.oxd-topbar-body-nav li', { hasText: 'Entitlements' });
    this.myEntitlementsLink = page.locator('.oxd-topbar-body-nav a', { hasText: 'My Entitlements' });
    this.entitlementTable = page.locator('.oxd-table');
    this.headerBreadcrumb = page.locator('.oxd-topbar-header-breadcrumb');
    this.noLeaveBalanceMessage = page.locator('p:has-text("No Leave Types with Leave Balance")');
  }

  async goto() {
    await this.page.goto('/web/index.php/leave/viewLeaveModule');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoApplyLeave() {
    await this.page.goto('/web/index.php/leave/applyLeave');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoMyLeave() {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoMyEntitlements() {
    await this.goto();
    await this.entitlementsLink.click();
    await this.myEntitlementsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async hasLeaveBalance(): Promise<boolean> {
    const noBalance = await this.noLeaveBalanceMessage.isVisible({ timeout: 3000 }).catch(() => false);
    return !noBalance;
  }

  async selectLeaveType(leaveType: string) {
    // Check if the dropdown is present (it won't be if no leave balance)
    const isDropdownVisible = await this.leaveTypeDropdown.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isDropdownVisible) {
      return false;
    }
    await this.leaveTypeDropdown.click();
    const option = this.page.locator('.oxd-select-option').nth(1);
    
    // Check if any leave types exist
    const hasOptions = await option.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasOptions) {
      return false;
    }
    
    await option.click();
    return true;
  }

  async setFromDate(date: string) {
    await this.fromDateInput.clear();
    await this.fromDateInput.fill(date);
    await this.fromDateInput.press('Escape');
  }

  async setToDate(date: string) {
    await this.toDateInput.clear();
    await this.toDateInput.fill(date);
    await this.toDateInput.press('Escape');
  }

  async applyForLeave(leaveType: string, fromDate: string, toDate: string, comment?: string): Promise<boolean> {
    await this.gotoApplyLeave();

    // Check if the user has leave balance
    const hasBalance = await this.hasLeaveBalance();
    if (!hasBalance) {
      return false; // No leave balance available
    }

    const selected = await this.selectLeaveType(leaveType);
    if (!selected) {
      return false;
    }

    await this.setFromDate(fromDate);
    await this.setToDate(toDate);

    if (comment) {
      await this.commentsInput.fill(comment);
    }

    await this.applyButton.click();
    return true;
  }

  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  async getLeaveRequests(): Promise<number> {
    await this.page.waitForLoadState('domcontentloaded');
    const count = await this.tableRows.count();
    return count;
  }

  async cancelLeaveRequest() {
    // Find the first leave request with a Cancel action button
    const cancelButton = this.page.locator('.oxd-table-body .oxd-table-row button', { hasText: 'Cancel' }).first();
    if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cancelButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async expectEntitlementsVisible() {
    // Wait for either the table or a "No Records Found" message
    const table = this.page.locator('.oxd-table');
    const noRecords = this.page.locator('.orangehrm-horizontal-padding', { hasText: 'No Records Found' });

    // Either the table should be visible or we get a "no records" message
    await expect(table.or(noRecords).first()).toBeVisible();
  }
}
