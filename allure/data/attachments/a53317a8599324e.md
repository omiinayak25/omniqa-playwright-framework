# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual/orangehrm/login.visual.spec.ts >> OrangeHRM · Login · Visual @visual @regression >> full login page matches the baseline (dynamic footer masked)
- Location: tests/visual/orangehrm/login.visual.spec.ts:34:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 720px, received 1280px by 768px. 123360 pixels (ratio 0.13 of all image pixels) are different.

  Snapshot: orangehrm-login-full.png

Call log:
  - Expect "toHaveScreenshot(orangehrm-login-full.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 720px, received 1280px by 768px. 123360 pixels (ratio 0.13 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 720px, received 1280px by 768px. 123360 pixels (ratio 0.13 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: "Username : Admin"
          - paragraph [ref=e15]: "Password : admin123"
        - generic [ref=e16]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: 
              - generic [ref=e21]: Username
            - textbox "Username" [active] [ref=e23]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
          - button "Login" [ref=e32] [cursor=pointer]
          - paragraph [ref=e34] [cursor=pointer]: Forgot your password?
        - separator [ref=e35]
        - paragraph [ref=e37]: Or login with
        - generic "njnjnjmn" [ref=e39] [cursor=pointer]:
          - paragraph [ref=e40]: njnjnjmn
      - generic [ref=e41]:
        - generic [ref=e42]:
          - link [ref=e43] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e46] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e49] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e52] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e55]:
          - paragraph [ref=e56]: OrangeHRM OS 5.8
          - paragraph [ref=e57]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e58] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e60]
```

# Test source

```ts
  1   | /**
  2   |  * --------------------------------------------------------
  3   |  * File: visual-comparator.ts
  4   |  * Module: Visual Regression
  5   |  * Project: OMNIQA Playwright Framework
  6   |  *
  7   |  * Purpose:
  8   |  * Reusable wrapper around Playwright's `toHaveScreenshot` snapshot assertion.
  9   |  * Owns the "how to take a stable, comparable screenshot" detail so specs do
  10  |  * one-liners and every snapshot shares the same stabilisation + tolerance.
  11  |  *
  12  |  * Responsibilities:
  13  |  * - Stabilise the page (fonts ready, injected freeze stylesheet, animations
  14  |  *   disabled) before capture.
  15  |  * - Merge env-driven defaults (config.visual) with per-call overrides and
  16  |  *   resolve dynamic-element masks.
  17  |  * - Assert full-page or per-element snapshots against committed baselines.
  18  |  *
  19  |  * Used By:
  20  |  * visual.fixtures.ts (DI as the `visual` fixture), tests/visual/** specs.
  21  |  *
  22  |  * Dependencies:
  23  |  * Playwright (expect/Page/Locator), node:path, winston Logger,
  24  |  * scopedLogger (@utils/logger), config (@config/config),
  25  |  * visual.types, dynamic-elements.
  26  |  *
  27  |  * Last Updated: 2026-06-28
  28  |  * Notes:
  29  |  * Baselines are stored by Playwright next to the spec in `*-snapshots/`, with
  30  |  * the project name AND platform appended to each file — so a single helper call
  31  |  * yields per-browser, per-OS baselines (true cross-browser snapshots) with no
  32  |  * extra code. First run writes baselines (`--update-snapshots`); later runs
  33  |  * compare against them.
  34  |  * --------------------------------------------------------
  35  |  */
  36  | import * as path from 'node:path';
  37  | import { expect, type Page, type Locator } from '@playwright/test';
  38  | import type { Logger } from 'winston';
  39  | import { scopedLogger } from '@utils/logger';
  40  | import { config } from '@config/config';
  41  | import type { VisualCompareOptions } from '@visual/visual.types';
  42  | import { toMaskLocators } from '@visual/dynamic-elements';
  43  | 
  44  | /** Absolute path to the freeze stylesheet injected during every capture. */
  45  | const STABILIZE_CSS = path.join(__dirname, 'screenshot.css');
  46  | 
  47  | /** Options common to page- and element-level snapshots. */
  48  | interface CommonScreenshotOptions {
  49  |   threshold: number;
  50  |   maxDiffPixelRatio: number;
  51  |   animations: 'disabled' | 'allow';
  52  |   caret: 'hide';
  53  |   stylePath: string | string[];
  54  |   mask?: Locator[];
  55  |   maxDiffPixels?: number;
  56  |   omitBackground?: boolean;
  57  |   timeout?: number;
  58  | }
  59  | 
  60  | /**
  61  |  * VisualComparator turns "is this screen visually unchanged?" into a single
  62  |  * call. TEST-scoped (bound to one page) and stateless between calls.
  63  |  */
  64  | export class VisualComparator {
  65  |   private readonly page: Page;
  66  |   private readonly log: Logger;
  67  |   private readonly defaults = config.visual;
  68  | 
  69  |   constructor(page: Page) {
  70  |     this.page = page;
  71  |     this.log = scopedLogger('Visual');
  72  |   }
  73  | 
  74  |   /**
  75  |    * Purpose: Assert the page matches its committed full-page/viewport baseline.
  76  |    * @param name - Stable snapshot name (becomes `<name>.png` + project/platform).
  77  |    * @param options - Optional per-call overrides (mask, threshold, fullPage…).
  78  |    * @returns Promise that resolves when the snapshot matches (or is written).
  79  |    * @example await visual.expectPage('saucedemo-login');
  80  |    */
  81  |   public async expectPage(name: string, options: VisualCompareOptions = {}): Promise<void> {
  82  |     await this.stabilize();
  83  |     const fullPage = options.fullPage ?? this.defaults.fullPage;
  84  |     this.log.info(`Visual compare (page, fullPage=${fullPage}): ${name}`);
> 85  |     await expect(this.page).toHaveScreenshot(this.fileName(name), {
      |                             ^ Error: expect(page).toHaveScreenshot(expected) failed
  86  |       ...this.buildCommon(options),
  87  |       fullPage,
  88  |     });
  89  |   }
  90  | 
  91  |   /**
  92  |    * Purpose: Assert a single element matches its committed baseline.
  93  |    * @param locator - Element to capture (e.g. a card, a form, a header).
  94  |    * @param name - Stable snapshot name.
  95  |    * @param options - Optional per-call overrides (mask, threshold…).
  96  |    * @returns Promise that resolves when the snapshot matches (or is written).
  97  |    * @example await visual.expectElement(page.locator('.login_form'), 'login-form');
  98  |    */
  99  |   public async expectElement(
  100 |     locator: Locator,
  101 |     name: string,
  102 |     options: VisualCompareOptions = {},
  103 |   ): Promise<void> {
  104 |     await this.stabilize();
  105 |     this.log.info(`Visual compare (element): ${name}`);
  106 |     await locator.scrollIntoViewIfNeeded();
  107 |     await expect(locator).toHaveScreenshot(this.fileName(name), this.buildCommon(options));
  108 |   }
  109 | 
  110 |   // ----------------------------------------------------------------- internals
  111 | 
  112 |   /** Wait for web fonts to finish loading so glyphs render identically. */
  113 |   private async stabilize(): Promise<void> {
  114 |     await this.page
  115 |       .evaluate(async () => {
  116 |         if (document.fonts !== undefined) await document.fonts.ready;
  117 |       })
  118 |       .catch(() => undefined);
  119 |   }
  120 | 
  121 |   /** Build the options shared by page and element snapshots. */
  122 |   private buildCommon(options: VisualCompareOptions): CommonScreenshotOptions {
  123 |     const mask = this.resolveMask(options);
  124 |     const common: CommonScreenshotOptions = {
  125 |       threshold: options.threshold ?? this.defaults.threshold,
  126 |       maxDiffPixelRatio: options.maxDiffPixelRatio ?? this.defaults.maxDiffPixelRatio,
  127 |       animations: options.animations ?? this.defaults.animations,
  128 |       caret: 'hide',
  129 |       stylePath: this.resolveStylePaths(options.stylePath),
  130 |     };
  131 |     if (mask.length > 0) common.mask = mask;
  132 |     if (options.maxDiffPixels !== undefined) common.maxDiffPixels = options.maxDiffPixels;
  133 |     if (options.omitBackground !== undefined) common.omitBackground = options.omitBackground;
  134 |     if (options.timeoutMs !== undefined) common.timeout = options.timeoutMs;
  135 |     return common;
  136 |   }
  137 | 
  138 |   /** Combine explicit mask locators with selector-based dynamic masks. */
  139 |   private resolveMask(options: VisualCompareOptions): Locator[] {
  140 |     const explicit = options.mask !== undefined ? [...options.mask] : [];
  141 |     const fromSelectors = toMaskLocators(this.page, options.maskSelectors ?? []);
  142 |     return [...explicit, ...fromSelectors];
  143 |   }
  144 | 
  145 |   /** Always inject the freeze stylesheet, then any caller-supplied sheets. */
  146 |   private resolveStylePaths(extra: string | readonly string[] | undefined): string | string[] {
  147 |     if (extra === undefined) return STABILIZE_CSS;
  148 |     const extras = typeof extra === 'string' ? [extra] : [...extra];
  149 |     return [STABILIZE_CSS, ...extras];
  150 |   }
  151 | 
  152 |   /** Normalise a logical name into a `.png` snapshot file name. */
  153 |   private fileName(name: string): string {
  154 |     return name.endsWith('.png') ? name : `${name}.png`;
  155 |   }
  156 | }
  157 | 
```