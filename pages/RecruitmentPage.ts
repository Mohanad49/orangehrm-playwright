import { Page, Locator, expect } from '@playwright/test';

export class RecruitmentPage {
  readonly vacanciesTab: Locator;
  readonly addButton: Locator;
  readonly vacancyNameInput: Locator;
  readonly jobTitleDropdown: Locator;
  readonly jobTitleOptions: Locator;
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
    // The open dropdown is portalled to the end of the body rather than nested
    // inside the field, so this is scoped to the visible dropdown list, not to
    // the Job Title grid item.
    this.jobTitleOptions = page.locator('.oxd-select-dropdown .oxd-select-option');
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
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoAddVacancy() {
    await this.page.goto('/web/index.php/recruitment/addJobVacancy');
    await this.page.waitForLoadState('domcontentloaded');
    await this.vacancyNameInput.waitFor({ state: 'visible' });
  }

  async addVacancy(vacancyName: string, jobTitle: string, hiringManager: string) {
    await this.gotoAddVacancy();

    await this.vacancyNameInput.fill(vacancyName);

    // Select job title from dropdown (use first available option to avoid relying on demo data)
    await this.jobTitleDropdown.click();

    // Wait for the dropdown to actually open. Hard wait on purpose: if the list
    // never renders, that is a hang or a defect, and it should be reported as
    // one.
    //
    // This used to be a 5 second isVisible() probe on the first option, and the
    // caller turned a false result into
    // `test.skip('No Job Titles available in demo environment')`. But that probe
    // returns false just as readily when the list is merely slow, so a latency
    // problem was being reported as a data problem - and reported by a test that
    // had never checked. Four tests skipped themselves that way, stating a cause
    // nobody had verified. A skip that asserts a reason it did not confirm is
    // worse than a failure, because it looks deliberate.
    await this.jobTitleOptions.first().waitFor({ state: 'visible' });

    // The first option appearing is NOT the answer to "does this environment
    // have job titles". While the job-titles request is in flight the dropdown
    // paints a single "No Records Found" row, and only replaces it once the data
    // arrives. Reading the list at that moment gives exactly the wrong answer,
    // confidently.
    //
    // Measured: a standalone probe that clicked and waited four seconds saw six
    // real job titles. The suite, which read the list as soon as an option was
    // visible, saw ["No Records Found"] and skipped all four recruitment tests
    // as "No Job Titles available in demo environment". The demo had the data
    // the entire time.
    //
    // So poll until the list settles into something selectable, and only
    // conclude the environment is empty if it is still empty when time is up.
    // That way a slow fetch waits, and a genuinely empty environment still
    // skips - and the two are no longer the same observation.
    const isRealOption = (t: string) =>
      t.trim().length > 0 && !/No Records Found|No Results Found|-- Select --/i.test(t);

    try {
      await expect
        .poll(async () => (await this.jobTitleOptions.allTextContents()).filter(isRealOption).length)
        .toBeGreaterThan(0);
    } catch {
      return false; // genuinely nothing to select, after a fair wait
    }

    const firstReal = this.jobTitleOptions.filter({ hasNotText: /No Records Found|-- Select --/i }).first();
    await firstReal.click();

    // Type hiring manager name to trigger autocomplete
    // The field expects an employee name, not username
    await this.hiringManagerInput.clear();
    await this.hiringManagerInput.pressSequentially(hiringManager, { delay: 100 });

    // Wait for autocomplete dropdown to appear and select first option
    const autocompleteOption = this.page.locator('.oxd-autocomplete-option').first();
    await autocompleteOption.waitFor({ state: 'visible' });
    await expect(autocompleteOption).not.toHaveText('Searching....');
    await autocompleteOption.click();

    // Wait for validation to clear after selecting from autocomplete
    await this.page.waitForTimeout(500);

    await this.saveButton.click();

    // Confirm the save actually took effect.
    //
    // This was previously:
    //
    //   const urlChanged = page.waitForURL(...).catch(() => null);
    //   await Promise.race([expect(successToast).toBeVisible(), urlChanged]);
    //
    // which cannot fail. `urlChanged` resolves to null when it times out, so the
    // race always settles whether or not anything was saved, and the expect()
    // never has to come true. Verified against the live demo: the POST returned
    // 200, no toast appeared, the URL never changed, the vacancy was absent from
    // the list afterwards - and this function still reported success.
    //
    // Racing two *booleans* keeps the original intent (either signal is fine)
    // while making a failure an actual failure.
    // On a successful save OrangeHRM 5.9 navigates to the new vacancy's own edit
    // page - /recruitment/addJobVacancy/{id} - not to /viewJobVacancy. The old
    // pattern only matched the latter, so a save that worked perfectly was read
    // as a failure. Matching either keeps this working if the redirect changes
    // back, and the trailing id is what distinguishes "saved" from "still
    // sitting on the empty form".
    const saved = await Promise.race([
      this.successToast.waitFor({ state: 'visible' }).then(() => true).catch(() => false),
      this.page
        .waitForURL(/\/recruitment\/(addJobVacancy\/\d+|viewJobVacancy)/)
        .then(() => true)
        .catch(() => false),
    ]);

    return saved;
  }

  async searchVacancyInList(vacancyName: string): Promise<boolean> {
    await this.gotoVacancies();

    // Wait for the table to actually render before deciding the row is absent.
    // Probing straight after navigation asked the question while the list was
    // still empty, so a vacancy that had been created seconds earlier read as
    // missing - the same "answered before the data arrived" mistake as the job
    // title dropdown above.
    const anyRow = this.page.locator('.oxd-table-body .oxd-table-row');
    const noRecords = this.page.locator('.orangehrm-horizontal-padding', { hasText: /No Records Found/i });
    await anyRow.first().or(noRecords.first()).waitFor({ state: 'visible' });

    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    return vacancyRow.isVisible().catch(() => false);
  }

  async editVacancy(vacancyName: string, updates: { description?: string }) {
    await this.gotoVacancies();

    // Click on the vacancy row to edit
    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    const editButton = vacancyRow.locator('.oxd-icon-button .bi-pencil-fill');
    await editButton.click();

    await this.page.waitForLoadState('domcontentloaded');

    if (updates.description) {
      const descriptionInput = this.page.locator('textarea');
      await descriptionInput.clear();
      await descriptionInput.fill(updates.description);
    }

    await this.saveButton.click();
    await expect(this.successToast).toBeVisible();
  }

  async deleteVacancy(vacancyName: string) {
    await this.gotoVacancies();

    const vacancyRow = this.page.locator('.oxd-table-body .oxd-table-row', { hasText: vacancyName });
    const trashButton = vacancyRow.locator('.oxd-icon-button .bi-trash');
    await trashButton.click();

    // Confirm deletion
    await this.confirmDeleteButton.click();
    await expect(this.successToast).toBeVisible();
  }
}
