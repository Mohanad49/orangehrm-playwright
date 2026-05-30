# OrangeHRM Playwright Automation
[![Playwright E2E Tests](https://github.com/Mohanad49/orangehrm-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/Mohanad49/orangehrm-playwright/actions/workflows/playwright.yml)

An end-to-end test automation framework built with [Playwright](https://playwright.dev/) and TypeScript, designed to test the [OrangeHRM Open Source Demo](https://opensource-demo.orangehrmlive.com). 

This project serves as a portfolio piece demonstrating how to automate complex enterprise workflows, handle dynamic UI elements, and structure a scalable automation framework using the Page Object Model (POM) design pattern.

## 🚀 Features

- **Page Object Model (POM)**: Highly maintainable and scalable architecture separating test logic from page interactions.
- **Enterprise Workflows**: Tests complex business logic including Employee Management, Leave Management, and Recruitment modules.
- **Dynamic Element Handling**: Robust handling of complex UI components like auto-suggest dropdowns and delayed DOM rendering.
- **Environment Resiliency**: Employs dynamic data generation and smart assertions to handle the inherent flakiness of shared public demo environments.
- **Allure Reporting**: Integrated with Allure for comprehensive, visual test execution reports.
- **TypeScript**: Strictly typed codebase for better tooling, refactoring, and error catching.

## 📂 Project Structure

```
orangehrm-playwright/
├── pages/                  # Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── EmployeeListPage.ts
│   ├── LeaveManagementPage.ts
│   └── RecruitmentPage.ts
├── tests/                  # End-to-End Test Suites
│   ├── auth/
│   │   └── login.spec.ts
│   ├── employees/
│   │   └── employee-management.spec.ts
│   ├── leave/
│   │   └── leave-management.spec.ts
│   └── recruitment/
│       └── recruitment.spec.ts
├── playwright.config.ts    # Playwright framework configuration
└── package.json            # Project dependencies and scripts
```

## 🧪 Test Coverage

The automation suite covers the following core modules:

1. **Authentication (`login.spec.ts`)**
   - Valid login flows
   - Invalid credential handling
   - Empty credential validation
   - Logout functionality

2. **Employee Management (`employee-management.spec.ts`)**
   - Creating new employee records
   - Editing personal details
   - Searching via dynamic autocomplete fields

3. **Leave Management (`leave-management.spec.ts`)**
   - Applying for specific leave types
   - Handling conditional UI states (e.g., users with zero leave balance)
   - Verifying leave entitlements and request cancellations

4. **Recruitment (`recruitment.spec.ts`)**
   - Adding new job vacancies
   - Managing hiring manager assignments
   - Editing and deleting vacancy records

## 🛠️ Technical Highlights

- **Smart Waits & Delays**: Uses `pressSequentially` with delays to simulate human input for triggering backend API calls in autocomplete fields.
- **State Verification**: Relies on data table verification rather than transient UI elements (like success toasts) for rock-solid assertions.
- **Playwright Trace Viewer**: Configured to capture screenshots, videos, and full DOM traces on test failures for rapid debugging.
