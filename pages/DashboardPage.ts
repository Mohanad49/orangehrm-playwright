import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly dashboardHeader: Locator;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;
  readonly sideMenu: Locator;

  constructor(private page: Page) {
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.locator('a[href="/web/index.php/auth/logout"]');
    this.sideMenu = page.locator('.oxd-sidepanel');
  }

  async expectToBeVisible() {
    await expect(this.dashboardHeader).toContainText('Dashboard');
  }

  async navigateTo(menuItem: string) {
    await this.page.locator('.oxd-main-menu-item', { hasText: menuItem }).click();
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }
}
