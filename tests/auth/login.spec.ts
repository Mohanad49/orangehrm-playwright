import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Authentication Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('Valid credentials → lands on dashboard', async () => {
    await loginPage.login('Admin', 'admin123');
    await dashboardPage.expectToBeVisible();
  });

  test('Invalid password → error message appears', async () => {
    await loginPage.login('Admin', 'wrongPassword');
    await loginPage.expectErrorMessage('Invalid credentials');
  });

  test('Empty username → validation message', async ({ page }) => {
    await loginPage.passwordInput.fill('admin123');
    await loginPage.loginButton.click();
    await loginPage.expectRequiredValidation();
  });

  test('Empty password → validation message', async ({ page }) => {
    await loginPage.usernameInput.fill('Admin');
    await loginPage.loginButton.click();
    await loginPage.expectRequiredValidation();
  });

  test('Successful logout → redirects to login page', async ({ page }) => {
    await loginPage.login('Admin', 'admin123');
    await dashboardPage.expectToBeVisible();

    await dashboardPage.logout();

    // Should be redirected back to login page
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
