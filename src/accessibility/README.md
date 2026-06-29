# Accessibility (axe-core) — OMINQA Playwright Framework

- **Purpose** — Reusable, DI-friendly accessibility (a11y) layer built on `@axe-core/playwright`. Provides scanning, keyboard-operability checks, intention-revealing assertions, and report generation so any spec can audit WCAG 2.0/2.1 A/AA in one line.

## Files

| File                          | Responsibility                                                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accessibility.types.ts`      | Type contracts (`A11yScanResult`, `A11yViolation`, `WcagTag`, `A11yImpact`), impact ordering, default WCAG tags, and curated `RULE_SETS` (alt text / labels / contrast / ARIA).                                       |
| `accessibility-scanner.ts`    | `AccessibilityScanner` — configures + runs AxeBuilder and normalises the raw result into a stable shape. Focused scans: `scanWcag/scanAltText/scanFormLabels/scanColorContrast/scanAria`. Scans only — never asserts. |
| `keyboard-navigator.ts`       | `KeyboardNavigator` — drives real Tab/Shift+Tab navigation, reports focused element, and answers reachability / focus-order questions.                                                                                |
| `accessibility-assertions.ts` | `AccessibilityAssertions` — the only collaborator that calls `expect`. Scan + record + assert helpers and keyboard assertions.                                                                                        |
| `accessibility-reporter.ts`   | `AccessibilityReporter` — writes per-scan JSON, attaches JSON + HTML summaries to the Playwright/Allure report, and regenerates an aggregate `reports/accessibility/index.html`.                                      |
| `index.ts`                    | Barrel — single import surface for the package.                                                                                                                                                                       |

## Design (SOLID)

- **SRP** — scan, drive-keyboard, assert, and report are four separate classes.
- **OCP** — added as a new fixture layer (`a11y.fixtures.ts`); nothing existing was modified except the one-line `@fixtures/index` re-export.
- **DIP** — assertions depend on injected collaborators (scanner / keyboard / reporter), wired in the fixture.
- **Stable shapes** — reports/specs depend on the framework's normalised types, not axe-core's raw output, so an axe upgrade can't silently break a report.

## Dependencies

- `@axe-core/playwright` (AxeBuilder) + `axe-core` (types only)
- `@playwright/test`, `winston` (Logger), `@utils/logger`, `@constants/paths.constants`

## Fixtures injected

`a11yScanner` · `keyboard` · `a11yReporter` · `a11y` (assertions) — all test-scoped, bound to the test's `page` / `TestInfo`.

## Usage Example

```ts
import { test } from '@fixtures/index';

test('login is accessible', async ({ a11y }) => {
  await a11y.expectNoViolations('SauceDemo · Login'); // full WCAG A/AA
  await a11y.expectAllFieldsLabeled('Login form'); // focused: labels
  await a11y.expectSufficientColorContrast('Login form'); // focused: contrast
  await a11y.expectReachableByTab('#login-button'); // keyboard
});
```

## Reports

- Per-scan JSON: `reports/accessibility/results/*.json`
- Aggregate dashboard: `reports/accessibility/index.html`
- Inline attachments in the Playwright HTML report and Allure (JSON + HTML summary).

## Run

```bash
npm run test:a11y
```
