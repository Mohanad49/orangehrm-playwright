import { chromium, expect } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**');

  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/addJobVacancy');
  await page.waitForLoadState('networkidle');

  const input = page.locator('.oxd-grid-item:has(.oxd-label:has-text("Hiring Manager")) input');
  await input.click();
  await input.pressSequentially('O', { delay: 100 });
  
  await input.clear();
  await input.pressSequentially('a', { delay: 100 });
  
  try {
    const option = page.locator('.oxd-autocomplete-option').first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    console.log('First option immediately:', await option.innerText());
    
    // Wait until it's not "Searching...."
    await expect(option).not.toHaveText('Searching....', { timeout: 10000 });
    console.log('Autocomplete works for "a"! First option after waiting:', await option.innerText());
  } catch (e) {
    console.log('Autocomplete failed for "a"', e);
  }

  await browser.close();
})();
