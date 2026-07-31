import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // These numbers are measured, not guessed, and the measurement is the point.
  //
  // The app under test is a shared public demo instance. A trace captured from a
  // failing CI run showed /web/index.php/core/i18n/messages returning 200 after
  // 10.9 seconds, with the login POST itself taking 3.5 seconds. Against the old
  // 30 second test timeout, a beforeEach that navigates, logs in and waits for
  // the dashboard had no headroom left, so 16 of 18 tests failed in CI while all
  // 18 passed locally. Nothing was wrong with the tests or the credentials - the
  // budget was just smaller than the server's worst observed response.
  //
  // Sized from that worst case with roughly 3x margin, rather than inflated
  // until things went green. Over-generous timeouts are their own bug: they turn
  // a hung page into a five minute wait and make a real regression look like a
  // slow day.
  timeout: 90000,
  expect: {
    // Covers that 10.9s i18n fetch, which any text assertion on a freshly
    // loaded page implicitly depends on.
    timeout: 30000,
  },
  fullyParallel: false,
  // Kept at 1. Retries here are not a way of hiding flakiness - the JSON
  // reporter records each attempt separately, so a test that fails and then
  // passes becomes same-commit flake evidence downstream in TestPulse.
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
    // Defaults to the public demo so `npx playwright test` still works with no
    // setup. CI points this at a containerised OrangeHRM instead - see
    // docker/README.md for why.
    baseURL: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Set centrally so "how long is this site allowed to take" is one decision
    // in one place. The page objects previously carried their own 10s and 15s
    // literals, which is how a suite ends up with a dozen different implicit
    // answers to that question and no way to change them together.
    actionTimeout: 30000,
    navigationTimeout: 45000,
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
