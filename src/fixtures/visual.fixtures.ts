/**
 * --------------------------------------------------------
 * File: visual.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Visual-regression link in the fixture chain — injects a ready-to-use
 * VisualComparator bound to the current test's `page`.
 *
 * Responsibilities:
 * - Extend a11y.fixtures (the previous chain tail) with a TEST-scoped
 *   `visual` fixture.
 *
 * Used By:
 * @fixtures/index (re-exports this composed `test`), tests/visual/**.
 *
 * Dependencies:
 * @fixtures/a11y.fixtures (chain parent), @visual/index.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Open/Closed: we ADD a layer here, never modify the existing fixtures. This
 * becomes the new chain tail surfaced by @fixtures/index, so spec import lines
 * stay unchanged.
 *
 * FIXTURE FLOW:
 *   base → page → api → db → a11y → visual (here)
 * --------------------------------------------------------
 */
import { test as base } from '@fixtures/a11y.fixtures';
import { VisualComparator } from '@visual/index';

export interface VisualFixtures {
  /** Screenshot comparator bound to the test's page. */
  readonly visual: VisualComparator;
}

export const test = base.extend<VisualFixtures>({
  visual: async ({ page }, use) => {
    await use(new VisualComparator(page));
  },
});

export { expect } from '@fixtures/base.fixtures';
