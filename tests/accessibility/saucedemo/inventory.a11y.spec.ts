/**
 * --------------------------------------------------------
 * File: inventory.a11y.spec.ts
 * Module: Accessibility Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory (products) screen accessibility.
 * Business Scenario: The authenticated product catalogue must be perceivable
 *   and operable; known gaps must be detected and explicitly triaged.
 * Preconditions: Logged-in SauceDemo session (performed inline — the a11y
 *   project carries no stored auth).
 * Test Strategy: Demonstrate (1) the scanner DETECTS a real violation, (2) a
 *   triaged-waiver compliance baseline, and (3) clean focused concerns.
 * Expected Outcome: The known `select-name` issue on the sort control is
 *   surfaced; the rest of the page passes; images/keyboard are accessible.
 * Priority: High
 * Tags: @a11y @accessibility @regression
 *
 * Last Updated: 2026-06-27
 * Notes:
 * SauceDemo's product-sort <select> ships without an accessible name — a real,
 * reproducible WCAG failure. Rather than hide it, we ASSERT the framework
 * catches it (detection), then gate the rest of the page with that single
 * rule waived (the enterprise "baseline + documented waiver" pattern).
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

// Authenticated screen — start from a clean session and log in inline.
test.use({ storageState: { cookies: [], origins: [] } });

const SCREEN = 'SauceDemo · Inventory';
/** Known, triaged gap: the product-sort <select> has no accessible name. */
const KNOWN_WAIVERS = ['select-name'];

test.describe('SauceDemo · Inventory · Accessibility @a11y @accessibility @regression', () => {
  test.beforeEach(async ({ sauceLoginPage, sauceInventoryPage }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('the scanner detects the known unlabeled sort control', async ({
    a11yScanner,
    a11yReporter,
  }) => {
    const result = await a11yScanner.scanWcag(`${SCREEN} · detection`);
    await a11yReporter.record(result);

    // Proves the tooling surfaces a genuine, reproducible WCAG failure.
    const ids = result.violations.map((v) => v.id);
    expect(ids).toContain('select-name');
  });

  test('@smoke inventory is compliant apart from triaged waivers', async ({ a11y }) => {
    // Baseline gate: everything must pass once the documented gap is waived.
    await a11y.expectNoViolations(`${SCREEN} · baseline`, { disableRules: KNOWN_WAIVERS });
  });

  test('product images all expose alternative text', async ({ a11y }) => {
    await a11y.expectNoAltTextIssues(`${SCREEN} · alt-text`);
  });

  test('text meets the WCAG AA colour-contrast ratio', async ({ a11y }) => {
    await a11y.expectSufficientColorContrast(`${SCREEN} · contrast`);
  });

  test('an add-to-cart button is reachable using only the Tab key', async ({ a11y }) => {
    await a11y.expectReachableByTab('button[data-test^="add-to-cart"]');
  });
});
