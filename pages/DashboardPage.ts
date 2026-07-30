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
    // Two assertions, deliberately in this order.
    //
    // The URL is the honest test of "did the login work". It changes as soon as
    // the server accepts the credentials, and depends on nothing else.
    //
    // The breadcrumb text does not. `.oxd-topbar-header-breadcrumb` renders
    // empty and is only filled once /web/index.php/core/i18n/messages returns
    // the translation strings. That request was measured at 10.9 seconds from a
    // CI runner, against Playwright's default 5 second expect timeout - so the
    // element existed, was empty, and the assertion reported
    // `Received string: ""` exactly as though the login had failed. It had not.
    //
    // Checking the URL first means a genuine auth failure still fails here fast
    // and for the right reason, rather than being hidden behind a long wait on
    // a slow translation fetch.
    await this.page.waitForURL(/\/dashboard\/index/);
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
