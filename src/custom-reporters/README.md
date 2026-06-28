# Custom Reporters — OMNIQA Playwright Framework

- **Purpose** — Custom Playwright reporters that produce additional run output beyond the built-in reporters.

## Files

| File                  | Responsibility                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `summary-reporter.ts` | Implements Playwright's `Reporter` interface — records each finished test, then on run end computes totals/pass-rate/slowest tests/failures-by-project, writes `reports/summary.json`, and prints a console summary. |

## Responsibilities

- Accumulate per-test records (`onTestEnd`) and aggregate them at `onEnd`.
- Emit a machine-readable `reports/summary.json` for CI plus a human-readable console block.

## Dependencies

- `@playwright/test/reporter` (Reporter interface + types), Node `fs`/`path`.

## Interacts With

- Registered in the `reporter` array in `playwright.config.ts`.

> Caveat: passing `--reporter` on the CLI overrides the config `reporter` array, so this reporter only runs when included in that array (or in the CLI override).

## Usage Example

```ts
// playwright.config.ts
export default defineConfig({
  reporter: [['./src/custom-reporters/summary-reporter.ts']],
});
```
