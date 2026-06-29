/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Fixtures (DI)
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Single, stable import surface for specs — re-exports the fully composed
 * `test`/`expect` plus the public fixture type contracts.
 *
 * Responsibilities:
 * - Re-export the composed `test`/`expect` from the end of the fixture chain.
 * - Re-export TestFixtures/WorkerFixtures/TestDataApi/PageFixtures types.
 *
 * Used By:
 * All specs: `import { test, expect } from '@fixtures/index';`
 *
 * Dependencies:
 * @fixtures/db.fixtures (chain tail), @fixtures/fixture.types,
 * @fixtures/page.fixtures.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Fixture composition chain (each extends the previous, Open/Closed):
 *   base.fixtures  → config + data + log + auto-log
 *   page.fixtures  → + page objects (SauceDemo, OrangeHRM)
 *   api.fixtures   → + API service classes (Auth/Booking/User/Product/Post/Pet)
 *   db.fixtures    → + QueryRunner, DbAssertions, repositories
 *   a11y.fixtures  → + axe scanner, keyboard navigator, a11y assertions/reporter
 *   visual.fixtures→ + VisualComparator (screenshot regression)
 *   perf.fixtures  → + perf collector/assertions/reporter + Lighthouse runner
 *   net.fixtures   → + NetworkManager (route mock / intercept / HAR)
 * Specs always import from here and never change their import line, so the
 * chain can grow without touching call sites.
 * --------------------------------------------------------
 */
export { test, expect } from '@fixtures/net.fixtures';
export type { TestFixtures, WorkerFixtures, TestDataApi } from '@fixtures/fixture.types';
export type { PageFixtures } from '@fixtures/page.fixtures';
export type { A11yFixtures } from '@fixtures/a11y.fixtures';
export type { VisualFixtures } from '@fixtures/visual.fixtures';
export type { PerfFixtures } from '@fixtures/perf.fixtures';
export type { NetworkFixtures } from '@fixtures/net.fixtures';
