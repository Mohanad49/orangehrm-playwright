-- Reference data a fresh OrangeHRM install does not ship with.
--
-- A clean install has no job titles and no leave types, so the recruitment and
-- leave specs have nothing to select and either skip or fail. The public demo
-- happened to have this data, which is why the gap only appeared once the app
-- was containerised.
--
-- Deliberately small and fixed. This is the reference data the suite needs to
-- exercise its journeys, not a fixture set the assertions depend on - the tests
-- still create their own records with unique names.

INSERT INTO ohrm_job_title (job_title, job_description, is_deleted) VALUES
  ('QA Engineer',       'Quality assurance engineer', 0),
  ('Software Engineer', 'Builds the thing QA breaks', 0),
  ('HR Manager',        'Human resources manager',    0);

INSERT INTO ohrm_leave_type (name, deleted) VALUES
  ('Annual Leave', 0),
  ('Sick Leave',   0),
  ('Casual Leave', 0);

-- The Leave module is unusable until a leave period is defined: a fresh install
-- redirects every leave URL to /leave/defineLeavePeriod and renders an empty
-- top-bar nav, so the leave specs cannot even find their menu items.
-- January 1st, matching the OrangeHRM default offered in that form.
--
-- Two rows are needed and the config flag is the one that actually gates the
-- redirect - inserting only the history row leaves the app still redirecting.
-- Found by defining the period through the UI once and diffing hs_hr_config.
INSERT INTO ohrm_leave_period_history (leave_period_start_month, leave_period_start_day, created_at)
VALUES (1, 1, CURDATE());

INSERT INTO hs_hr_config (name, value) VALUES ('leave_period_defined', 'Yes')
  ON DUPLICATE KEY UPDATE value = 'Yes';

-- Entitlements for the admin employee, so "apply for leave" has a balance to
-- draw against and the entitlements view has something to display.
INSERT INTO ohrm_leave_entitlement
  (emp_number, no_of_days, days_used, leave_type_id, from_date, to_date, credited_date, note, entitlement_type, deleted)
SELECT e.emp_number, 20, 0, lt.id,
       CONCAT(YEAR(CURDATE()), '-01-01 00:00:00'),
       CONCAT(YEAR(CURDATE()), '-12-31 00:00:00'),
       CURDATE(), 'seeded for E2E', 1, 0
FROM hs_hr_employee e CROSS JOIN ohrm_leave_type lt
WHERE e.emp_number IS NOT NULL;
