import { Page, Locator, expect } from '@playwright/test';

export class RecruitmentPage {
  readonly vacanciesTab: Locator;
  readonly addButton: Locator;
  readonly vacancyNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly hiringManagerInput: Locator;
  readonly statusToggle: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;
  readonly tableRows: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly headerBreadcrumb: Locator;
  readonly recordsCount: Locator;

  constructor(private page: Page) {
    this.vacanciesTab = page.locator('.oxd-topbar-body-nav a', { hasText: 'Vacancies' });
    this.addButton = page.locator('.orangehrm-header-container button');
    this.vacancyNameInput = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Vacancy Name")) input.oxd-input');
    this.jobTitleDropdown = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Job Title")) .oxd-select-text');
    this.hiringManagerInput = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Hiring Manager")) input');
    this.statusToggle = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Active")) .oxd-switch-input');
    this.saveButton = page.locator('button[type="submit"]');
    this.successToast = page.locator('.oxd-toast--success');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-row');
    this.deleteButton = page.locator('.oxd-table-body .oxd-table-row .oxd-icon-button .bi-trash');
    this.confirmDeleteButton = page.locator('.oxd-dialog-sheet button', { hasText: 'Yes, Delete' });
    this.headerBreadcrumb = page.locator('.oxd-topbar-header-breadcrumb');
    this.recordsCount = page.locator('.orangehrm-horizontal-padding span');
  }

  async gotoVacancies() {
    await this.page.goto('/web/index.php/recruitment/viewJobVacancy');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAddVacancy() {
    await this.page.goto('/web/index.php/recruitment/addJobVacancy');
    await this.page.waitForLoadState('networkidle');
    await this.vacancyNameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async addVacancy(vacancyName: string, jobTitle: string, hiringManager: string) {
    await this.gotoAddVacancy();

    await this.vacancyNameInput.fill(vacancyName);

    // Select job title from dropdown
    await this.jobTitleDropdown.click();
    const jobOption = this.page.locator('.oxd-select-option', { hasText: jobTitle }).first();
    await jobOption.waitFor({ state: 'visible', timeout: 5000 });
    await jobOption.click();

    // Type hiring manager name to trigger autocomplete
    // The field expects an employee name, not username
    await this.hiringManagerInput.clear();
    await this.hiringManagerInput.pressSequentially(hiringManager, { delay: 100 });

    // Wait for autocomplete dropdown to appear and select first option
    const autocompleteOption = this.page.locator('.oxd-autocomplete-option').first();
    await autocompleteOption.waitFor({ state: 'visible', timeout: 10000 });
    await expect(autocompleteOption).not.toHaveText('Searching....', { timeout: 10000 });
    await autocompleteOption.click();

    // Wait for validation to clear after selecting from autocomplete
    await this.page.waitForTimeout(500);

    await this.saveButton.click();

    // Wait for either success toast or navigation to the vacancy edit page
    const successToast = this.successToast;
    const urlChanged = this.page.waitForURL('**/viewJobVacancy/**', { timeout: 15000 }).catch(() => null);

    await Promise.race([
      expect(successToast).toBeVisible({ timeout: 15000 }),
      urlChanged,
    ]);
  }

  async searchVacancyInList(vacancyName: string): Promise<boolean> {
    await this.gotoVacancies();

    // Check if vacancy appears in the table
    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    return vacancyRow.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async editVacancy(vacancyName: string, updates: { description?: string }) {
    await this.gotoVacancies();

    // Click on the vacancy row to edit
    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    const editButton = vacancyRow.locator('.oxd-icon-button .bi-pencil-fill');
    await editButton.click();

    await this.page.waitForLoadState('networkidle');

    if (updates.description) {
      const descriptionInput = this.page.locator('textarea');
      await descriptionInput.clear();
      await descriptionInput.fill(updates.description);
    }

    await this.saveButton.click();
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
  }

  async deleteVacancy(vacancyName: string) {
    await this.gotoVacancies();

    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    const trashButton = vacancyRow.locator('.oxd-icon-button .bi-trash');
    await trashButton.click();

    // Confirm deletion
    await this.confirmDeleteButton.click();
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
  }
}
