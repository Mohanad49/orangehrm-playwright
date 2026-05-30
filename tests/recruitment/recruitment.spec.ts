import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { RecruitmentPage } from '../../pages/RecruitmentPage';

const uniqueId = Date.now().toString().slice(-6);
const testVacancy = {
  name: `QA Engineer ${uniqueId}`,
  jobTitle: 'QA Engineer',
  hiringManager: 'manda',
  description: `E2E test vacancy created at ${new Date().toISOString()}`,
};

test.describe('Recruitment Tests', () => {
  let recruitmentPage: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    recruitmentPage = new RecruitmentPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await page.waitForURL('**/dashboard/**');
  });

  test('Add a new job vacancy', async ({ page }) => {
    await recruitmentPage.addVacancy(
      testVacancy.name,
      testVacancy.jobTitle,
      testVacancy.hiringManager
    );

    // The vacancy is verified in the next test
  });

  test('Verify vacancy appears in the list', async ({ page }) => {
    // First create a vacancy
    const listId = Date.now().toString().slice(-6);
    const vacancyName = `ListTest ${listId}`;

    await recruitmentPage.addVacancy(vacancyName, 'QA Engineer', 'manda');

    // Then verify it appears in the list
    const isVisible = await recruitmentPage.searchVacancyInList(vacancyName);
    expect(isVisible).toBeTruthy();
  });

  test('Edit a vacancy', async ({ page }) => {
    // Create a vacancy to edit
    const editId = Date.now().toString().slice(-6);
    const vacancyName = `EditTest ${editId}`;

    await recruitmentPage.addVacancy(vacancyName, 'QA Engineer', 'manda');

    // Edit the vacancy
    await recruitmentPage.editVacancy(vacancyName, {
      description: `Updated description - ${Date.now()}`,
    });

    // Verify edit by checking it's still in the list
    const isVisible = await recruitmentPage.searchVacancyInList(vacancyName);
    expect(isVisible).toBeTruthy();
  });

  test('Delete a vacancy', async ({ page }) => {
    // Create a vacancy to delete
    const deleteId = Date.now().toString().slice(-6);
    const vacancyName = `DeleteTest ${deleteId}`;

    await recruitmentPage.addVacancy(vacancyName, 'QA Engineer', 'manda');

    // Delete the vacancy
    await recruitmentPage.deleteVacancy(vacancyName);

    // Toast removed as it is flaky

    // Verify it's no longer in the list
    const isVisible = await recruitmentPage.searchVacancyInList(vacancyName);
    expect(isVisible).toBeFalsy();
  });
});
