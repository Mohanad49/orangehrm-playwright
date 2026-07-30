import { Page, Locator, expect } from '@playwright/test';

export class EmployeeListPage {
  readonly addEmployeeButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly searchEmployeeName: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly tableRows: Locator;
  readonly recordsCount: Locator;
  readonly successToast: Locator;
  readonly headerBreadcrumb: Locator;

  constructor(private page: Page) {
    this.addEmployeeButton = page.locator('.orangehrm-header-container button');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.employeeIdInput = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Employee Id")) input.oxd-input');
    this.saveButton = page.locator('button[type="submit"]');
    this.searchEmployeeName = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Employee Name")) input');
    this.searchButton = page.locator('button[type="submit"]');
    this.resetButton = page.locator('button[type="reset"]');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-row');
    this.recordsCount = page.locator('.orangehrm-horizontal-padding span');
    this.successToast = page.locator('.oxd-toast--success');
    this.headerBreadcrumb = page.locator('.oxd-topbar-header-breadcrumb');
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await this.searchButton.waitFor({ state: 'visible' });
  }

  async gotoAddEmployee() {
    await this.page.goto('/web/index.php/pim/addEmployee');
    await this.firstNameInput.waitFor({ state: 'visible' });
  }

  async addEmployee(firstName: string, lastName: string, employeeId?: string) {
    await this.gotoAddEmployee();

    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);

    if (employeeId) {
      await this.employeeIdInput.clear();
      await this.employeeIdInput.fill(employeeId);
    }

    await this.saveButton.click();
    // After successful add, OrangeHRM navigates to the employee's personal details page
    await this.page.waitForURL('**/viewPersonalDetails/**');
  }

  async searchEmployee(name: string) {
    await this.goto();

    // Type slowly into the autocomplete field to trigger suggestions
    await this.searchEmployeeName.first().clear();
    await this.searchEmployeeName.first().pressSequentially(name, { delay: 50 });

    // Wait for autocomplete suggestions to load
    const autocompleteOption = this.page.locator('.oxd-autocomplete-option').first();
    const hasAutocomplete = await autocompleteOption.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasAutocomplete) {
      await autocompleteOption.click();
    }

    await this.searchButton.click();
    await this.recordsCount.waitFor({ state: 'visible' });

    // Wait for table to update
    await this.page.waitForTimeout(1000);
  }

  async getRecordsCount(): Promise<string> {
    const text = await this.recordsCount.textContent();
    return text ?? '0';
  }

  async getEmployeeCount(): Promise<number> {
    const text = await this.getRecordsCount();
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async editPersonalDetails(updates: { middleName?: string }) {
    // On the personal details page after adding/navigating to employee
    if (updates.middleName) {
      const middleNameInput = this.page.locator('input[name="middleName"]');
      await middleNameInput.waitFor({ state: 'visible' });
      await middleNameInput.clear();
      await middleNameInput.fill(updates.middleName);
    }

    // Click the first save button (Personal Details section)
    await this.page.locator('form').first().locator('button[type="submit"]').click();
    await expect(this.successToast).toBeVisible();
  }
}
