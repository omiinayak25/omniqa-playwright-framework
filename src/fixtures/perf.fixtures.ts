/**
 * --------------------------------------------------------
 * File: perf.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Performance link in the fixture chain — injects a metrics collector, the
 * budget assertions, a reporter, and the Lighthouse runner into tests.
 *
 * Responsibilities:
 * - Extend visual.fixtures (the previous chain tail) with TEST-scoped
 *   performance fixtures wired by constructor injection.
 *
 * Used By:
 * @fixtures/index (re-exports this composed `test`), tests/performance/**.
 *
 * Dependencies:
 * @fixtures/visual.fixtures (chain parent), @performance/index.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Open/Closed: ADD a layer, never modify existing fixtures. This is the new
 * chain tail surfaced by @fixtures/index, so spec import lines stay unchanged.
 *
 * FIXTURE FLOW:
 *   base → page → api → db → a11y → visual → perf (here)
 * --------------------------------------------------------
 */
import { test as base } from '@fixtures/visual.fixtures';
import {
  PerformanceCollector,
  PerformanceAssertions,
  PerformanceReporter,
  LighthouseRunner,
} from '@performance/index';

export interface PerfFixtures {
  /** Low-level timing-metrics collector bound to the test's page. */
  readonly perf: PerformanceCollector;
  /** Budget assertions (collect + record + assert). */
  readonly perfAssert: PerformanceAssertions;
  /** Persists + attaches performance captures for the current test. */
  readonly perfReporter: PerformanceReporter;
  /** Optional Lighthouse CLI runner (config-gated). */
  readonly lighthouse: LighthouseRunner;
}

export const test = base.extend<PerfFixtures>({
  perf: async ({ page }, use) => {
    await use(new PerformanceCollector(page));
  },
  perfReporter: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use,
    testInfo,
  ) => {
    await use(new PerformanceReporter(testInfo));
  },
  perfAssert: async ({ perf, perfReporter }, use) => {
    await use(new PerformanceAssertions(perf, perfReporter));
  },
  lighthouse: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use,
  ) => {
    await use(new LighthouseRunner());
  },
});

export { expect } from '@fixtures/base.fixtures';
