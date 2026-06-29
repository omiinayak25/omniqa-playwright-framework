# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui/orangehrm/add-employee.spec.ts >> OrangeHRM · Add Employee form @ui @regression @forms >> cancel returns to the employee list
- Location: tests/ui/orangehrm/add-employee.spec.ts:83:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: 'Cancel' })

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
          - heading "个人信息管理系统" [level=6] [ref=e114]
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
          - listitem [ref=e132] [cursor=pointer]:
            - generic [ref=e133]:
              - text: 设置
              - generic [ref=e134]: 
          - listitem [ref=e135] [cursor=pointer]:
            - link "员工列表" [ref=e136]:
              - /url: "#"
          - listitem [ref=e137] [cursor=pointer]:
            - link "添加员工" [ref=e138]:
              - /url: "#"
          - listitem [ref=e139] [cursor=pointer]:
            - link "报告" [ref=e140]:
              - /url: "#"
          - button "" [ref=e142] [cursor=pointer]:
            - generic [ref=e143]: 
  - generic [ref=e144]:
    - generic [ref=e147]:
      - heading "添加员工" [level=6] [ref=e148]
      - separator [ref=e149]
      - generic [ref=e150]:
        - generic [ref=e151]:
          - generic [ref=e152]:
            - generic [ref=e154]:
              - button "Choose File"
              - generic [ref=e155]:
                - img "profile picture" [ref=e157]
                - button "" [ref=e158] [cursor=pointer]:
                  - generic [ref=e159]: 
            - paragraph [ref=e160]: "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px"
          - generic [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e165]:
                - generic [ref=e167]: Employee Full Name*
                - generic [ref=e168]:
                  - textbox "名字" [ref=e171]
                  - textbox "中间名" [ref=e174]
                  - textbox "姓" [ref=e177]
              - generic [ref=e180]:
                - generic [ref=e182]: 员工识别号
                - textbox [ref=e184]: "0429"
            - separator [ref=e185]
            - generic [ref=e186]:
              - paragraph [ref=e187]: 创建登录详情
              - checkbox [ref=e190]
        - separator [ref=e192]
        - generic [ref=e193]:
          - paragraph [ref=e194]: "* 需要"
          - button "取消" [ref=e195] [cursor=pointer]
          - button "保存" [ref=e196] [cursor=pointer]
    - generic [ref=e197]:
      - paragraph [ref=e198]: OrangeHRM OS 5.8
      - paragraph [ref=e199]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e200] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  1   | /**
  2   |  * --------------------------------------------------------
  3   |  * File: base.page.ts
  4   |  * Module: Page Objects
  5   |  * Project: OMNIQA Playwright Framework
  6   |  *
  7   |  * Purpose:
  8   |  * Abstract root of the Page Object Model. Provides navigation and shared,
  9   |  * logged interaction helpers that every concrete page inherits.
  10  |  *
  11  |  * Responsibilities:
  12  |  * - Hold the Playwright `page` and a scoped logger
  13  |  * - Require subclasses to supply `baseUrl` + `path`, and navigate via open()
  14  |  * - Offer DRY logged helpers (click/type/readText/select/waitForUrlContains)
  15  |  *   that wrap Playwright's auto-waiting web-first APIs (no manual sleeps)
  16  |  *
  17  |  * Design rules enforced:
  18  |  * - Pages hold LOCATORS and ACTIONS only; business assertions live in tests.
  19  |  *   Pages may expose state via getters so tests can assert on it.
  20  |  * - Concrete pages provide their own `path` and compose Components.
  21  |  *
  22  |  * Used By:
  23  |  * Extended by every page object (saucedemo/* and orangehrm/*)
  24  |  *
  25  |  * Dependencies:
  26  |  * Playwright (Page, Locator, Response), winston Logger, scopedLogger (@utils/logger)
  27  |  *
  28  |  * Last Updated: 2026-06-27
  29  |  * --------------------------------------------------------
  30  |  */
  31  | import type { Page, Locator, Response } from '@playwright/test';
  32  | import type { Logger } from 'winston';
  33  | import { scopedLogger } from '@utils/logger';
  34  | 
  35  | /**
  36  |  * BasePage is the inheritance root of the POM. It exists to centralise
  37  |  * navigation and common logged interactions so concrete pages stay focused on
  38  |  * their own locators and screen-specific actions (DRY).
  39  |  */
  40  | export abstract class BasePage {
  41  |   protected readonly page: Page;
  42  |   protected readonly log: Logger;
  43  | 
  44  |   /** Absolute base URL of the owning application (subclass provides it). */
  45  |   protected abstract readonly baseUrl: string;
  46  |   /** Route path appended to baseUrl for this page's primary screen. */
  47  |   protected abstract readonly path: string;
  48  | 
  49  |   protected constructor(page: Page) {
  50  |     this.page = page;
  51  |     this.log = scopedLogger(this.constructor.name);
  52  |   }
  53  | 
  54  |   /**
  55  |    * Purpose: Navigate to this page's primary URL (baseUrl + path).
  56  |    * @returns Promise resolving to the navigation Response (or null if none).
  57  |    * @example await new SauceInventoryPage(page).open();
  58  |    */
  59  |   public async open(): Promise<Response | null> {
  60  |     const url = `${this.baseUrl}${this.path}`;
  61  |     this.log.info(`Navigating to ${url}`);
  62  |     return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  63  |   }
  64  | 
  65  |   /**
  66  |    * Purpose: Return the browser's current page URL.
  67  |    * @returns The current URL string.
  68  |    */
  69  |   public url(): string {
  70  |     return this.page.url();
  71  |   }
  72  | 
  73  |   /**
  74  |    * Purpose: Return the current document title.
  75  |    * @returns Promise resolving to the page title.
  76  |    */
  77  |   public async title(): Promise<string> {
  78  |     return this.page.title();
  79  |   }
  80  | 
  81  |   // ----------------------------------------------------- logged action helpers
  82  | 
  83  |   /**
  84  |    * Purpose: Click a locator while emitting a debug log line.
  85  |    * @param locator - Target element to click.
  86  |    * @param name - Human-readable name used in the log message.
  87  |    * @returns Promise that resolves once the click completes.
  88  |    */
  89  |   protected async click(locator: Locator, name: string): Promise<void> {
  90  |     this.log.debug(`Click: ${name}`);
> 91  |     await locator.click();
      |                   ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  92  |   }
  93  | 
  94  |   /**
  95  |    * Purpose: Fill an input with a value while emitting a debug log line.
  96  |    * @param locator - Target input element.
  97  |    * @param value - Value to fill in.
  98  |    * @param name - Human-readable name used in the log message.
  99  |    * @returns Promise that resolves once the input is filled.
  100 |    */
  101 |   protected async type(locator: Locator, value: string, name: string): Promise<void> {
  102 |     this.log.debug(`Type into ${name}: "${value}"`);
  103 |     await locator.fill(value);
  104 |   }
  105 | 
  106 |   /**
  107 |    * Purpose: Read and trim a locator's text content while logging it.
  108 |    * @param locator - Target element to read.
  109 |    * @param name - Human-readable name used in the log message.
  110 |    * @returns Promise resolving to the trimmed text ('' when empty).
  111 |    */
  112 |   protected async readText(locator: Locator, name: string): Promise<string> {
  113 |     const text = (await locator.textContent())?.trim() ?? '';
  114 |     this.log.debug(`Read ${name}: "${text}"`);
  115 |     return text;
  116 |   }
  117 | 
  118 |   /**
  119 |    * Purpose: Select a dropdown option by its value while logging it.
  120 |    * @param locator - Target <select> element.
  121 |    * @param value - Option value to select.
  122 |    * @param name - Human-readable name used in the log message.
  123 |    * @returns Promise that resolves once the option is selected.
  124 |    */
  125 |   protected async selectByValue(locator: Locator, value: string, name: string): Promise<void> {
  126 |     this.log.debug(`Select ${name}: "${value}"`);
  127 |     await locator.selectOption(value);
  128 |   }
  129 | 
  130 |   /**
  131 |    * Purpose: Wait until the page URL contains a fragment — used after actions
  132 |    * that trigger client-side navigation before tests assert on the new screen.
  133 |    * @param fragment - Substring expected to appear in the URL.
  134 |    * @param timeoutMs - Max wait in milliseconds (default 15000).
  135 |    * @returns Promise that resolves once the URL matches.
  136 |    */
  137 |   protected async waitForUrlContains(fragment: string, timeoutMs = 15_000): Promise<void> {
  138 |     await this.page.waitForURL((url) => url.toString().includes(fragment), { timeout: timeoutMs });
  139 |   }
  140 | }
  141 | 
```