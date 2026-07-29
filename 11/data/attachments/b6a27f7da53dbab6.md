# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/login.spec.ts >> Authentication Tests >> Successful logout → redirects to login page
- Location: tests/auth/login.spec.ts:37:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.oxd-topbar-header-breadcrumb')
Expected substring: "Dashboard"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.oxd-topbar-header-breadcrumb')
    - waiting for" https://opensource-demo.orangehrmlive.com/web/index.php/auth/validate" navigation to finish...
    - navigated to "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic:
    - complementary [ref=e4]:
      - navigation "Sidepanel" [ref=e5]:
        - generic [ref=e6]:
          - link "client brand banner" [ref=e7] [cursor=pointer]:
            - /url: https://www.orangehrm.com/
            - img "client brand banner" [ref=e9]
          - text: 
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - textbox "Search" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Admin" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: Admin
            - listitem [ref=e25]:
              - link "PIM" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: PIM
            - listitem [ref=e41]:
              - link "Leave" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: Leave
            - listitem [ref=e46]:
              - link "Time" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: Time
            - listitem [ref=e54]:
              - link "Recruitment" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: Recruitment
            - listitem [ref=e62]:
              - link "My Info" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: My Info
            - listitem [ref=e70]:
              - link "Performance" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: Performance
            - listitem [ref=e80]:
              - link "Dashboard" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: Dashboard
            - listitem [ref=e85]:
              - link "Directory" [ref=e86] [cursor=pointer]:
                - /url: /web/index.php/directory/viewDirectory
                - generic [ref=e89]: Directory
            - listitem [ref=e90]:
              - link "Maintenance" [ref=e91] [cursor=pointer]:
                - /url: /web/index.php/maintenance/viewMaintenanceModule
                - generic [ref=e95]: Maintenance
            - listitem [ref=e96]:
              - link "Claim" [ref=e97] [cursor=pointer]:
                - /url: /web/index.php/claim/viewClaimModule
                - img [ref=e100]
                - generic [ref=e104]: Claim
            - listitem [ref=e105]:
              - link "Buzz" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: Buzz
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "Dashboard" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: TEBlYoRGDh KEMgyLzmjL
              - generic [ref=e128]: 
      - navigation "Topbar Menu" [ref=e130]:
        - list [ref=e131]:
          - button "" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: 
  - generic [ref=e135]:
    - generic [ref=e137]:
      - generic [ref=e139]:
        - generic [ref=e141]:
          - generic [ref=e142]: 
          - paragraph [ref=e143]: Time at Work
        - separator [ref=e144]
      - generic [ref=e148]:
        - generic [ref=e150]:
          - generic [ref=e151]: 
          - paragraph [ref=e152]: My Actions
        - separator [ref=e153]
        - generic [ref=e155]:
          - img "No Content" [ref=e156]
          - paragraph [ref=e157]: No Pending Actions to Perform
      - generic [ref=e159]:
        - generic [ref=e161]:
          - generic [ref=e162]: 
          - paragraph [ref=e163]: Quick Launch
        - separator [ref=e164]
      - generic [ref=e168]:
        - generic [ref=e170]:
          - generic [ref=e171]: 
          - paragraph [ref=e172]: Buzz Latest Posts
        - separator [ref=e173]
      - generic [ref=e177]:
        - generic [ref=e178]:
          - paragraph [ref=e183]: Employees on Leave Today
          - generic [ref=e184] [cursor=pointer]: 
        - separator [ref=e185]
      - generic [ref=e189]:
        - generic [ref=e191]:
          - generic [ref=e192]: 
          - paragraph [ref=e193]: Employee Distribution by Sub Unit
        - separator [ref=e194]
      - generic [ref=e198]:
        - generic [ref=e200]:
          - generic [ref=e201]: 
          - paragraph [ref=e202]: Employee Distribution by Location
        - separator [ref=e203]
    - generic [ref=e206]:
      - paragraph [ref=e207]: OrangeHRM OS 5.9
      - paragraph [ref=e208]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e209] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | 
  3  | export class DashboardPage {
  4  |   readonly dashboardHeader: Locator;
  5  |   readonly userDropdown: Locator;
  6  |   readonly logoutLink: Locator;
  7  |   readonly sideMenu: Locator;
  8  | 
  9  |   constructor(private page: Page) {
  10 |     this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb');
  11 |     this.userDropdown = page.locator('.oxd-userdropdown-tab');
  12 |     this.logoutLink = page.locator('a[href="/web/index.php/auth/logout"]');
  13 |     this.sideMenu = page.locator('.oxd-sidepanel');
  14 |   }
  15 | 
  16 |   async expectToBeVisible() {
> 17 |     await expect(this.dashboardHeader).toContainText('Dashboard');
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  18 |   }
  19 | 
  20 |   async navigateTo(menuItem: string) {
  21 |     await this.page.locator('.oxd-main-menu-item', { hasText: menuItem }).click();
  22 |   }
  23 | 
  24 |   async logout() {
  25 |     await this.userDropdown.click();
  26 |     await this.logoutLink.click();
  27 |   }
  28 | }
  29 | 
```