/**
 * --------------------------------------------------------
 * File: login.perf.spec.ts
 * Module: Performance Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM login screen — load-performance smoke (heavy
 *   Angular SPA bundle).
 * Business Scenario: Even a heavy vendor SPA must stay under an agreed ceiling;
 *   the budget is the contract that flags a doubling of payload or load time.
 * Preconditions: Network access to the OrangeHRM demo.
 * Test Strategy: Capture + budget-gate with a budget sized to the (large) SPA.
 * Expected Outcome: Within the generous SPA budget; full metrics reported.
 * Priority: Medium
 * Tags: @perf
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Observed locally: load ≈ 4.7s, FCP/LCP ≈ 5.2s, ~3.6 MB transferred. The
 * budget carries ~2× headroom so CI variance does not cause false failures
 * while a genuine regression still trips it.
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';
import type { PerformanceBudget } from '@performance/index';

const BUDGET: PerformanceBudget = {
  maxTtfbMs: 5_000,
  maxDomContentLoadedMs: 15_000,
  maxLoadMs: 15_000,
  maxFcpMs: 12_000,
  maxLcpMs: 12_000,
  maxTransferBytes: 8_388_608, // 8 MB
  maxResourceCount: 60,
};

test.describe('OrangeHRM · Login · Performance @perf', () => {
  test.beforeEach(async ({ orangeLoginPage, page }) => {
    await orangeLoginPage.open();
    await orangeLoginPage.isLoaded();
    await page.waitForLoadState('load');
  });

  test('@smoke login screen loads within the SPA budget', async ({ perfAssert }) => {
    await perfAssert.expectWithinBudget('OrangeHRM · Login', BUDGET);
  });
});
