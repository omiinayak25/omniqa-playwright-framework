# Lifecycle Hooks — OMINQA Playwright Framework

- **Purpose** — Global Playwright run hooks wired into `playwright.config.ts` that bracket the entire test run (run once before all tests, once after).

## Files

| File                 | Responsibility                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `global-setup.ts`    | Runs once before all tests: ensures output dirs exist, writes Allure metadata, and prints a run banner.   |
| `global-teardown.ts` | Runs once after all tests: closes the shared DB pool (no-op if never opened) and prints a closing banner. |

## Responsibilities

- Prepare runtime output directories and Allure metadata before any test writes.
- Release shared process-wide resources (DB pool) after the run.
- Emit run banners for CI traceability.

## Dependencies

- `@playwright/test` (FullConfig), `@config/config`, `@utils/logger`, `@utils/file.util`, `@utils/allure-meta`, `@database/db-pool`.

## Interacts With

- Registered in `playwright.config.ts` as `globalSetup` / `globalTeardown`; teardown closes the pool from `@database`.

## Usage Example

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('@hooks/global-setup'),
  globalTeardown: require.resolve('@hooks/global-teardown'),
});
```
