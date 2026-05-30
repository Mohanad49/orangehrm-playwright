import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly requiredMessages: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.requiredMessages = page.locator('.oxd-input-field-error-message');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorAlert).toHaveText(message);
  }

  async expectRequiredValidation() {
    await expect(this.requiredMessages.first()).toBeVisible();
  }
}
