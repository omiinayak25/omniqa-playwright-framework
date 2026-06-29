# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui/orangehrm/dashboard.spec.ts >> OrangeHRM · Dashboard @ui @regression @dashboard >> @smoke the dashboard header reads "Dashboard"
- Location: tests/ui/orangehrm/dashboard.spec.ts:32:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Dashboard"
Received string:    "仪表盘"
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
              - textbox "搜索" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "管理员" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: 管理员
            - listitem [ref=e25]:
              - link "个人信息管理系统" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: 个人信息管理系统
            - listitem [ref=e41]:
              - link "休假" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: 休假
            - listitem [ref=e46]:
              - link "时间" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: 时间
            - listitem [ref=e54]:
              - link "招聘" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: 招聘
            - listitem [ref=e62]:
              - link "我的信息" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: 我的信息
            - listitem [ref=e70]:
              - link "绩效" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: 绩效
            - listitem [ref=e80]:
              - link "仪表盘" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: 仪表盘
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
              - link "激动" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: 激动
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "仪表盘" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: AdminAuto User
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
        - generic [ref=e146]:
          - generic [ref=e147]:
            - img "profile picture" [ref=e149]
            - generic [ref=e150]:
              - paragraph [ref=e151]: Punched In
              - paragraph [ref=e152]: "Punched In: Today at 09:08 AM (GMT 5.5)"
          - generic [ref=e153]:
            - generic [ref=e154]: 0h 9m Today
            - button "" [ref=e155] [cursor=pointer]:
              - generic [ref=e156]: 
          - separator [ref=e157]
          - generic [ref=e158]:
            - generic [ref=e159]:
              - paragraph [ref=e160]: This Week
              - paragraph [ref=e161]: Jun 29 - Jul 05
            - generic [ref=e162]:
              - generic [ref=e163]: 
              - paragraph [ref=e164]: 0h 0m
      - generic [ref=e168]:
        - generic [ref=e170]:
          - generic [ref=e171]: 
          - paragraph [ref=e172]: My Actions
        - separator [ref=e173]
        - generic [ref=e175]:
          - generic [ref=e176]:
            - button [ref=e177] [cursor=pointer]
            - paragraph [ref=e183] [cursor=pointer]: (1) Pending Self Review
          - generic [ref=e184]:
            - button [ref=e185] [cursor=pointer]
            - paragraph [ref=e194] [cursor=pointer]: (1) Candidate to Interview
      - generic [ref=e196]:
        - generic [ref=e198]:
          - generic [ref=e199]: 
          - paragraph [ref=e200]: Quick Launch
        - separator [ref=e201]
        - generic [ref=e203]:
          - generic [ref=e204]:
            - button "分配休假" [ref=e205] [cursor=pointer]
            - generic "分配休假" [ref=e208]:
              - paragraph [ref=e209]: 分配休假
          - generic [ref=e210]:
            - button "休假列表" [ref=e211] [cursor=pointer]
            - generic "休假列表" [ref=e218]:
              - paragraph [ref=e219]: 休假列表
          - generic [ref=e220]:
            - button "工时表" [ref=e221] [cursor=pointer]
            - generic "工时表" [ref=e227]:
              - paragraph [ref=e228]: 工时表
          - generic [ref=e229]:
            - button "申请休假" [ref=e230] [cursor=pointer]
            - generic "申请休假" [ref=e233]:
              - paragraph [ref=e234]: 申请休假
          - generic [ref=e235]:
            - button "我的休假" [ref=e236] [cursor=pointer]
            - generic "我的休假" [ref=e241]:
              - paragraph [ref=e242]: 我的休假
          - generic [ref=e243]:
            - button "我的时间表" [ref=e244] [cursor=pointer]
            - generic "我的时间表" [ref=e247]:
              - paragraph [ref=e248]: 我的时间表
      - generic [ref=e250]:
        - generic [ref=e252]:
          - generic [ref=e253]: 
          - paragraph [ref=e254]: Buzz Latest Posts
        - separator [ref=e255]
        - generic [ref=e257]:
          - generic [ref=e258]:
            - generic [ref=e259] [cursor=pointer]:
              - img "profile picture" [ref=e261]
              - generic [ref=e262]:
                - paragraph [ref=e263]: AdminAuto QA User
                - paragraph [ref=e264]: 2020-08-10 03:38 AM
            - separator [ref=e265]
            - paragraph [ref=e266]: "Hi All; Linda has been blessed with a baby boy! Linda: With love, we welcome your dear new baby to this world. Congratulations!"
          - generic [ref=e267]:
            - generic [ref=e268] [cursor=pointer]:
              - img "profile picture" [ref=e270]
              - generic [ref=e271]:
                - paragraph [ref=e272]: Sania Shaheen
                - paragraph [ref=e273]: 2020-08-10 03:38 AM
            - separator [ref=e274]
            - paragraph [ref=e275]: "World Championship: What makes the perfect snooker player? Mark Selby: Robertson has one of the best techniques in the game. It is very, very straight and he fully commits to every single shot he plays. John Higgins: Every shot is repetitive. He always keeps the same technique and cues through the ball bang straight. Barry Hawkins: Robertson is textbook with his grip and has a ramrod solid cue action, delivering it in a straight line. Honourable mentions: Shaun Murphy, Ding Junhui, Jack Lisowski."
          - generic [ref=e276]:
            - generic [ref=e277] [cursor=pointer]:
              - img "profile picture" [ref=e279]
              - generic [ref=e280]:
                - paragraph [ref=e281]: Rebecca Harmony
                - paragraph [ref=e282]: 2020-08-10 03:34 AM
            - separator [ref=e283]
            - paragraph [ref=e284]: Throwback Thursdays!!
            - img
          - generic [ref=e285]:
            - generic [ref=e286] [cursor=pointer]:
              - img "profile picture" [ref=e288]
              - generic [ref=e289]:
                - paragraph [ref=e290]: Russel Hamilton
                - paragraph [ref=e291]: 2020-08-10 03:33 AM
            - separator [ref=e292]
            - paragraph [ref=e293]: Live SIMPLY Dream BIG Be GREATFULL Give LOVE Laugh LOT.......
      - generic [ref=e295]:
        - generic [ref=e296]:
          - paragraph [ref=e301]: Employees on Leave Today
          - generic [ref=e302] [cursor=pointer]: 
        - separator [ref=e303]
        - generic [ref=e305]:
          - img "No Content" [ref=e306]
          - paragraph [ref=e307]: No Employees are on Leave Today
      - generic [ref=e309]:
        - generic [ref=e311]:
          - generic [ref=e312]: 
          - paragraph [ref=e313]: Employee Distribution by Sub Unit
        - separator [ref=e314]
        - list [ref=e319]:
          - listitem [ref=e320] [cursor=pointer]:
            - generic "Engineering" [ref=e322]
          - listitem [ref=e323] [cursor=pointer]:
            - generic "Human Resources" [ref=e325]
          - listitem [ref=e326] [cursor=pointer]:
            - generic "Administration" [ref=e328]
          - listitem [ref=e329] [cursor=pointer]:
            - generic "Client Services" [ref=e331]
          - listitem [ref=e332] [cursor=pointer]:
            - generic "Unassigned" [ref=e334]
      - generic [ref=e336]:
        - generic [ref=e338]:
          - generic [ref=e339]: 
          - paragraph [ref=e340]: Employee Distribution by Location
        - separator [ref=e341]
        - list [ref=e346]:
          - listitem [ref=e347] [cursor=pointer]:
            - generic "Texas R&D" [ref=e349]
          - listitem [ref=e350] [cursor=pointer]:
            - generic "New York Sales Office" [ref=e352]
          - listitem [ref=e353] [cursor=pointer]:
            - generic "Unassigned" [ref=e355]
    - generic [ref=e356]:
      - paragraph [ref=e357]: OrangeHRM OS 5.8
      - paragraph [ref=e358]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e359] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  1  | /**
  2  |  * --------------------------------------------------------
  3  |  * File: dashboard.spec.ts
  4  |  * Module: UI Tests · Dashboard
  5  |  * Project: OMNIQA Playwright Framework
  6  |  *
  7  |  * Feature Under Test: OrangeHRM Dashboard landing screen.
  8  |  * Business Scenario: After login the dashboard must render its widgets, quick
  9  |  *                    launch, identity, and a working menu filter.
  10 |  * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
  11 |  * Test Strategy: Widget/identity/navigation assertions on the landing screen.
  12 |  * Expected Outcome: Header, widgets, quick launch, user, and menu filter work.
  13 |  * Priority: Medium
  14 |  * Tags: @ui @regression @dashboard
  15 |  *
  16 |  * Last Updated: 2026-06-28
  17 |  * Notes: Heavy SPA — test.slow().
  18 |  * --------------------------------------------------------
  19 |  */
  20 | import { test, expect } from '@fixtures/index';
  21 | import { ORANGE_AUTH_FILE } from '@constants/paths.constants';
  22 | 
  23 | test.use({ storageState: ORANGE_AUTH_FILE });
  24 | 
  25 | test.describe('OrangeHRM · Dashboard @ui @regression @dashboard', () => {
  26 |   test.beforeEach(async ({ orangeDashboardPage }) => {
  27 |     test.slow(); // heavy SPA
  28 |     await orangeDashboardPage.open();
  29 |     expect(await orangeDashboardPage.isLoaded()).toBe(true);
  30 |   });
  31 | 
  32 |   test('@smoke the dashboard header reads "Dashboard"', async ({ orangeDashboardPage }) => {
> 33 |     expect(await orangeDashboardPage.headerText()).toContain('Dashboard');
     |                                                    ^ Error: expect(received).toContain(expected) // indexOf
  34 |   });
  35 | 
  36 |   test('dashboard widgets render', async ({ orangeDashboardPage }) => {
  37 |     expect(await orangeDashboardPage.widgetCount()).toBeGreaterThan(0);
  38 |   });
  39 | 
  40 |   test('the Quick Launch widget is present', async ({ orangeDashboardPage }) => {
  41 |     expect(await orangeDashboardPage.hasQuickLaunch()).toBe(true);
  42 |   });
  43 | 
  44 |   test('the logged-in user is shown in the top bar', async ({ orangeDashboardPage }) => {
  45 |     expect((await orangeDashboardPage.loggedInUser()).length).toBeGreaterThan(0);
  46 |   });
  47 | 
  48 |   test('the side-menu search filters the navigation', async ({ orangeDashboardPage }) => {
  49 |     const before = await orangeDashboardPage.sideMenuItems();
  50 |     await orangeDashboardPage.filterMenu('Admin');
  51 |     const after = await orangeDashboardPage.sideMenuItems();
  52 |     expect(after.length).toBeLessThan(before.length);
  53 |     expect(after.some((m) => m.includes('Admin'))).toBe(true);
  54 |   });
  55 | });
  56 | 
```