/**
 * --------------------------------------------------------
 * File: checkout.perf.spec.ts
 * Module: Performance Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout-information screen — load budget.
 * Business Scenario: The checkout entry screen must render within budget.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Capture timings via perfAssert/perf and gate against a budget.
 * Expected Outcome: Metrics within a generous (gross-regression) budget.
 * Priority: Low
 * Tags: @perf
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import type { PerformanceBudget } from '@performance/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const BUDGET: PerformanceBudget = {
  maxTtfbMs: 1_500,
  maxDomContentLoadedMs: 3_000,
  maxLoadMs: 4_000,
  maxFcpMs: 2_500,
  maxLcpMs: 3_000,
  maxTransferBytes: 1_048_576,
  maxResourceCount: 30,
};

test.describe('SauceDemo · Checkout · Performance @perf', () => {
  test.beforeEach(async ({ sauceCheckoutInfoPage, page }) => {
    await sauceCheckoutInfoPage.open();
    await page.waitForLoadState('load');
  });

  test('@smoke checkout information screen loads within budget', async ({ perfAssert }) => {
    await perfAssert.expectWithinBudget('SauceDemo · Checkout info', BUDGET);
  });

  test('checkout navigation timing is captured', async ({ perf, perfReporter }) => {
    const metrics = await perf.collect('SauceDemo · Checkout info · timing');
    await perfReporter.record(metrics);
    expect(metrics.loadMs).toBeGreaterThan(0);
  });
});
