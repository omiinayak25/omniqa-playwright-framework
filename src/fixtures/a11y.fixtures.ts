/**
 * --------------------------------------------------------
 * File: a11y.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Accessibility link in the fixture chain — injects a ready-to-use axe-core
 * scanner, keyboard navigator, reporter, and the high-level `a11y` assertions
 * into tests, each bound to the current test's `page`/`TestInfo`.
 *
 * Responsibilities:
 * - Extend db.fixtures (the previous chain tail) with TEST-scoped a11y fixtures.
 * - Wire the collaborators together via constructor injection.
 *
 * Used By:
 * @fixtures/index (re-exports this composed `test`), and tests/accessibility/**.
 *
 * Dependencies:
 * @fixtures/db.fixtures (chain parent), @accessibility/index.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Open/Closed: we ADD a layer here, never modify the existing base/page/api/db
 * fixtures. This becomes the new chain tail surfaced by @fixtures/index, so
 * spec import lines (`@fixtures/index`) stay unchanged.
 *
 * FIXTURE FLOW:
 *   base → page → api → db → a11y (here)
 * --------------------------------------------------------
 */
import { test as base } from '@fixtures/db.fixtures';
import {
  AccessibilityScanner,
  AccessibilityAssertions,
  AccessibilityReporter,
  KeyboardNavigator,
} from '@accessibility/index';

export interface A11yFixtures {
  /** Low-level axe-core scanner bound to the test's page. */
  readonly a11yScanner: AccessibilityScanner;
  /** Keyboard-operability driver bound to the test's page. */
  readonly keyboard: KeyboardNavigator;
  /** Persists + attaches scan artifacts for the current test. */
  readonly a11yReporter: AccessibilityReporter;
  /** High-level, intention-revealing accessibility assertions. */
  readonly a11y: AccessibilityAssertions;
}

export const test = base.extend<A11yFixtures>({
  a11yScanner: async ({ page }, use) => {
    await use(new AccessibilityScanner(page));
  },
  keyboard: async ({ page }, use) => {
    await use(new KeyboardNavigator(page));
  },
  a11yReporter: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use,
    testInfo,
  ) => {
    await use(new AccessibilityReporter(testInfo));
  },
  a11y: async ({ a11yScanner, keyboard, a11yReporter }, use) => {
    await use(new AccessibilityAssertions(a11yScanner, keyboard, a11yReporter));
  },
});

export { expect } from '@fixtures/base.fixtures';
