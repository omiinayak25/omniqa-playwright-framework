# Helpers — OMNIQA Playwright Framework

- **Purpose** — Reusable **orchestration** that *coordinates* existing utilities, config, and constants. Helpers contain no new low-level logic and no assertions — they compose what already exists so callers (hooks, setup) stay thin.

## Why this folder exists

Some logic spans multiple primitives (read config + env + a file → produce an option). Inlining that in hooks/specs causes drift. Helpers give it one tested home — **without duplicating** the utilities they coordinate.

## When to use it

- You're combining ≥2 existing pieces (config + env + file/util) into a reusable decision/option.
- **Do NOT** add a helper that merely wraps one existing class — that's duplication. (This is why there is no `ApiAssertionHelper`/`AccessibilityHelper`/`VisualHelper`/`PerformanceHelper`/`DatabaseHelper`/`BDDHelper` — `ResponseValidator`, `AccessibilityAssertions`, `VisualComparator`, `PerformanceAssertions`, `db-availability`/repositories, and the World already do those jobs.)

## Files

| File                       | Responsibility                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| `environment.helper.ts`    | `EnvironmentHelper` — env / CI / slow-mo queries + one-line run `describe()`.   |
| `browser.helper.ts`        | `BrowserHelper` — Chromium launch options (headless + slowMo) for the BDD runner.|
| `storage-state.helper.ts`  | `StorageStateHelper` — reuse saved auth sessions → BrowserContext options.       |
| `index.ts`                 | Barrel export (`@helpers`).                                                     |

## How it integrates (real callers)

- `src/cucumber/hooks.ts` — `BrowserHelper.launchChromium()` (BeforeAll) and `StorageStateHelper.contextOptionsFor(SAUCE_AUTH_FILE)` (`@auth` Before). This also gives the Cucumber runner **SLOWMO_MS** support, matching the Playwright config.
- `src/hooks/global-setup.ts` — `EnvironmentHelper.describe()` in the run banner.

## Design / enterprise principles

- **DRY / Composition** — coordinate `@config`, `@utils/file.util`, `@playwright/test`; never re-implement them.
- **KISS, no dead code** — three helpers, every method has a caller.
- **Strict TypeScript** — typed returns (`LaunchOptions`, `BrowserContextOptions`, `AppEnvironment`), no `any`.

## Usage Example

```ts
import { BrowserHelper, StorageStateHelper } from '@helpers';

const browser = await BrowserHelper.launchChromium();
const context = await browser.newContext(StorageStateHelper.contextOptionsFor(SAUCE_AUTH_FILE));
```
