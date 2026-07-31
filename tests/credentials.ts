/**
 * Where the suite gets its login from.
 *
 * The defaults are the public OrangeHRM demo, so `npx playwright test` works
 * with no setup. CI overrides them, because the containerised instance cannot
 * use the demo's password: OrangeHRM 5.9 rejects `admin123` as weak and
 * redirects straight to a "Change Weak Password" screen instead of the
 * dashboard - which looks exactly like a broken login until you read the page.
 *
 * Kept in one module rather than inlined in each spec so that pointing the suite
 * at a different instance is one environment change, not eight edits.
 */
export const CREDENTIALS = {
  username: process.env.ORANGEHRM_USERNAME ?? 'Admin',
  password: process.env.ORANGEHRM_PASSWORD ?? 'admin123',
} as const;

/**
 * An employee name the Hiring Manager autocomplete will actually match.
 *
 * This is instance data, not a constant. The public demo has an employee whose
 * name contains "manda"; a freshly installed instance has exactly one employee,
 * the admin. Hardcoding the demo's value made the vacancy form fail validation
 * silently on any other instance - the autocomplete matched nothing, so the
 * field was never populated and the save was rejected with no visible error.
 */
export const TEST_DATA = {
  hiringManager: process.env.ORANGEHRM_HIRING_MANAGER ?? 'manda',
} as const;
