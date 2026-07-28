import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  retries: 1,
  // The JSON reporter is here for a specific reason: it is the only one of these
  // that records per-attempt results, so it is the only one that can tell a
  // downstream tool "this test failed and then passed on retry". Allure and HTML
  // both collapse a retried test to its final verdict, which throws away the
  // strongest flakiness evidence a run can produce.
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['json', { outputFile: 'playwright-report.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: ['--disable-gpu'],
        },
      },
    },
  ],
});
