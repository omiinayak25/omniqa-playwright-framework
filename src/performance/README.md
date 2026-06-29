# Performance Smoke — OMINQA Playwright Framework

- **Purpose** — Reusable, DI-friendly performance smoke layer. Captures W3C Navigation / Paint / LCP / Resource timing from a loaded page, gates it against an env-driven **performance budget**, reports artifacts, and offers an optional **Lighthouse** audit.

## Files

| File                        | Responsibility                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `performance.types.ts`      | Contracts — `PerformanceMetrics`, `NetworkTiming`, `ResourceSummary`, `PerformanceBudget`, `BudgetViolation`, `LighthouseSummary`.                        |
| `performance-collector.ts`  | `PerformanceCollector` — reads timings in-page (TTFB, DCL, load, FCP, buffered LCP, network phases, resource aggregation). Collects only.                 |
| `performance-assertions.ts` | `PerformanceAssertions` — merges budget with `config.performance`, evaluates to typed violations, collects + records + asserts. The only `expect` caller. |
| `performance-reporter.ts`   | `PerformanceReporter` — per-capture JSON, JSON/HTML attachments, and a rolling `reports/performance/index.html` dashboard.                                |
| `lighthouse-runner.ts`      | `LighthouseRunner` — optional, config-gated; runs the Lighthouse CLI and normalises the score + core-web-vital audits.                                    |
| `index.ts`                  | Barrel — single import surface.                                                                                                                           |

## Metrics captured

Page Load · DOMContentLoaded · TTFB · DOM Interactive · First Contentful Paint · Largest Contentful Paint · Network phases (DNS/TCP/TLS/request/response) · Resource timing (count, transfer, by-type buckets, slowest).

## Budget (env-driven, `config.performance.budget`)

| Env var                     | Default |
| --------------------------- | ------- |
| `PERF_MAX_LOAD_MS`          | `5000`  |
| `PERF_MAX_DCL_MS`           | `4000`  |
| `PERF_MAX_TTFB_MS`          | `1500`  |
| `PERF_MAX_FCP_MS`           | `3000`  |
| `PERF_MAX_LCP_MS`           | `4000`  |
| `PERF_MAX_TRANSFER_KB`      | `2048`  |
| `PERF_MAX_RESOURCES`        | `100`   |
| `LIGHTHOUSE_ENABLED`        | `false` |
| `LIGHTHOUSE_MIN_PERF_SCORE` | `0.5`   |

Specs may pass a per-call `PerformanceBudget` that overrides a subset of these (sensible because SauceDemo ≈ 1 s vs. the OrangeHRM SPA ≈ 5 s). Unavailable paint metrics (LCP/FCP = -1) are skipped, never failed.

## Usage Example

```ts
import { test } from '@fixtures/index';
import type { PerformanceBudget } from '@performance/index';

const BUDGET: PerformanceBudget = { maxLoadMs: 4000, maxLcpMs: 3000, maxTransferBytes: 1_048_576 };

test('login is fast enough', async ({ perfAssert, page, sauceLoginPage }) => {
  await sauceLoginPage.open();
  await page.waitForLoadState('load');
  await perfAssert.expectWithinBudget('SauceDemo · Login', BUDGET);
});
```

## Lighthouse (opt-in)

```bash
LIGHTHOUSE_ENABLED=true npm run test:perf   # runs the Lighthouse audit spec
```

Shelled out via `npx lighthouse` (CLI), so the CommonJS framework avoids ESM-interop with Lighthouse and keeps it a truly optional dependency. Needs a Chrome/Chromium binary; skips cleanly when disabled.

## Run

```bash
npm run test:perf
# dashboard: reports/performance/index.html
```
