# Visual Regression — OMINQA Playwright Framework

- **Purpose** — Reusable, DI-friendly visual-regression layer over Playwright's `toHaveScreenshot`. Provides one-line, deterministic full-page and per-element snapshot assertions with shared stabilisation, env-driven tolerance, and central dynamic-element masking.

## Files

| File                   | Responsibility                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `visual.types.ts`      | `VisualCompareOptions` — per-call overrides (mask, threshold, ratio, fullPage…).                                                              |
| `visual-comparator.ts` | `VisualComparator` — stabilises the page, merges `config.visual` defaults with overrides, resolves masks, and asserts page/element snapshots. |
| `dynamic-elements.ts`  | `DYNAMIC_SELECTORS` registry + `toMaskLocators()` — named selector groups for non-deterministic UI (clocks, copyright years, avatars).        |
| `screenshot.css`       | Freeze stylesheet injected during every capture (kills animations/transitions, hides caret + scrollbars).                                     |
| `index.ts`             | Barrel — single import surface.                                                                                                               |

## How baselines work

- Stored by Playwright next to each spec in `*-snapshots/`, with **project name + platform** appended to every file name → genuine **cross-browser / cross-OS** baselines from a single helper call.
- Baselines are **committed** (the source of truth) — they are _not_ git-ignored.
- First run writes them; later runs compare. Regenerate intentionally with `--update-snapshots`.

## Configuration (env-driven, `config.visual`)

| Env var                       | Default    | Meaning                                          |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `VISUAL_MAX_DIFF_PIXEL_RATIO` | `0.02`     | Max share of differing pixels before fail.       |
| `VISUAL_THRESHOLD`            | `0.2`      | Per-pixel colour sensitivity (0 strict … 1 lax). |
| `VISUAL_ANIMATIONS`           | `disabled` | Freeze CSS animations during capture.            |
| `VISUAL_FULL_PAGE`            | `true`     | Default to full-page captures.                   |

Global defaults are also wired into `playwright.config.ts` → `expect.toHaveScreenshot`.

## Usage Example

```ts
import { test } from '@fixtures/index';
import { DYNAMIC_SELECTORS } from '@visual/index';

test('login looks right', async ({ visual, page }) => {
  await visual.expectPage('saucedemo-login-full'); // full page
  await visual.expectElement(page.locator('.login-box'), 'form'); // element
  await visual.expectPage('orangehrm-login-full', {
    // mask dynamics
    maskSelectors: DYNAMIC_SELECTORS.ORANGEHRM_LOGIN,
  });
});
```

## Run

```bash
npm run test:visual                       # compare against baselines
npm run test:visual -- --update-snapshots # (re)generate baselines deliberately
```
