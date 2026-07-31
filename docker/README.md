# Why this suite runs against a container

The suite used to point at `opensource-demo.orangehrmlive.com`. It went from
2 of 18 tests passing in CI to 18 of 18 once the app under test moved into a
container. Every one of those failures was caused by the demo, not by the tests
— and every one of them *looked* like a bug in this repository.

## What the public demo was actually doing

**It silently discarded writes.** Creating a vacancy returned `HTTP 200`, no
error, no toast — and the record never appeared in the list. Four recruitment
tests could never have passed. They were not failing honestly either: a helper
raced an assertion against a `.catch(() => null)`, so the fallback always
resolved and the check could not fail.

**Its own data was broken.** The Hiring Manager autocomplete returned literal
`"${firstName}  ${lastName}"` strings — unrendered template placeholders — so
there was no valid employee to select and the form failed validation with no
visible message.

**It was slow enough to break assertions.** A trace from a failing run showed
`/web/index.php/core/i18n/messages` returning 200 after **10.9 seconds**. The
dashboard breadcrumb is populated from those translations, so asserting its text
with Playwright's default 5-second timeout reported `Received string: ""` —
indistinguishable from a failed login. Every spec logs in during `beforeEach`,
so a single slow request took down sixteen tests.

None of that is fixable from inside a test. It is also invisible: the suite was
red, and every symptom pointed at code that was fine.

## What this gives us

| | Public demo | Container |
|---|---|---|
| Passing | 2 / 18 | **18 / 18** |
| Full suite | ~8 min | **~1 min** |
| Writes persist | no | yes |
| Reproducible | no | yes |

Roughly eight times faster, mostly because it is not queueing behind everyone
else on the internet.

## How it works

```bash
./docker/up.sh            # compose up, install, seed, verify
npx playwright test
```

- **`docker-compose.yml`** — OrangeHRM 5.9 + MariaDB 10.6.
- **`install.sh`** — drives the installer's own HTTP API. OrangeHRM ships a CLI
  installer, but it refuses `--no-interaction` and its prompt order does not
  match its config file, so the API is the only reliable unattended path. It
  applies all 35 schema migrations, one call per version, the way the setup
  wizard does. Takes about 50 seconds.
- **`seed.sql`** — reference data a clean install does not ship with: job titles,
  leave types, a leave period, and entitlements. Without these the recruitment
  and leave specs have nothing to select. The demo happened to have this data,
  which is why the gap only appeared once the app was containerised.
- **`up.sh`** — orchestrates the above and then *verifies* the result: table
  count, job titles, leave period. That check exists because a half-installed
  OrangeHRM still serves a perfectly normal login page — during development, an
  install that had written its config and created **zero** tables looked
  completely healthy from the outside.

## Things that cost time, recorded so they do not again

- **The admin password must be strong.** OrangeHRM 5.9 rejects `admin123` and
  redirects to "Change Weak Password" instead of the dashboard, which looks
  exactly like a failed login.
- **A leave period needs two rows, not one.** Inserting into
  `ohrm_leave_period_history` is not enough; the redirect is gated on
  `leave_period_defined = Yes` in `hs_hr_config`. Found by defining the period
  through the UI once and diffing that table.
- **`clean-up-install` deletes the installer.** A container cannot be
  reinstalled, only recreated. Fine here, since every run starts from empty.
- **The Leave top-bar menu does not render in this build.** Every selector for
  it matches zero elements, so the entitlements page object navigates by URL —
  as the rest of the page objects already did.

## Credentials

Set via environment, defaulting to the public demo so `npx playwright test`
still works with no setup at all:

| Variable | Default | CI |
|---|---|---|
| `ORANGEHRM_BASE_URL` | the public demo | `http://localhost:8090` |
| `ORANGEHRM_USERNAME` | `Admin` | `Admin` |
| `ORANGEHRM_PASSWORD` | `admin123` | `Ohrm@1423` |
| `ORANGEHRM_HIRING_MANAGER` | `manda` | `OrangeHRM` |

The CI password is not a secret. The instance is created empty and destroyed
with the runner.
