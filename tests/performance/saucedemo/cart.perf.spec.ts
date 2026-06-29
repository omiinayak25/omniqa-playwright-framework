/**
 * --------------------------------------------------------
 * File: cart.perf.spec.ts
 * Module: Performance Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart screen — load-performance smoke.
 * Business Scenario: The cart must render within an agreed budget.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Capture navigation/paint timings via perfAssert and gate them.
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

test.describe('SauceDemo · Cart · Performance @perf', () => {
  test.beforeEach(async ({ sauceCartPage, page }) => {
    await sauceCartPage.open();
    await page.waitForLoadState('load');
  });

  test('@smoke cart screen loads within budget', async ({ perfAssert }) => {
    await perfAssert.expectWithinBudget('SauceDemo · Cart', BUDGET);
  });

  test('cart navigation timing is captured', async ({ perf, perfReporter }) => {
    const metrics = await perf.collect('SauceDemo · Cart · timing');
    await perfReporter.record(metrics);
    expect(metrics.loadMs).toBeGreaterThan(0);
    expect(metrics.resources.count).toBeGreaterThan(0);
  });
});
