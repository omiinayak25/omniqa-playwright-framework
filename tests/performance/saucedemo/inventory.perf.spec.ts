/**
 * --------------------------------------------------------
 * File: inventory.perf.spec.ts
 * Module: Performance Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory screen — load-performance smoke.
 * Business Scenario: The authenticated product catalogue (image-heavy) must
 *   stay within an agreed payload + load budget.
 * Preconditions: Logged-in SauceDemo session (performed inline — the perf
 *   project carries no stored auth).
 * Test Strategy: Capture + budget-gate the inventory; assert the resource
 *   breakdown surfaces image payload.
 * Expected Outcome: Within budget; resource breakdown reported.
 * Priority: Medium
 * Tags: @perf
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Observed locally: ~15 resources, ~346 KB transferred — budget set with
 * headroom for CDN/image variance.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import type { PerformanceBudget } from '@performance/index';

test.use({ storageState: { cookies: [], origins: [] } });

const BUDGET: PerformanceBudget = {
  maxTtfbMs: 1_500,
  maxDomContentLoadedMs: 4_000,
  maxLoadMs: 6_000,
  maxFcpMs: 3_000,
  maxLcpMs: 4_000,
  maxTransferBytes: 2_097_152, // 2 MB
  maxResourceCount: 50,
};

test.describe('SauceDemo · Inventory · Performance @perf', () => {
  test.beforeEach(async ({ sauceLoginPage, sauceInventoryPage, page }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    await page.waitForLoadState('load');
  });

  test('@smoke inventory loads within budget', async ({ perfAssert }) => {
    await perfAssert.expectWithinBudget('SauceDemo · Inventory', BUDGET);
  });

  test('resource timing breaks payload down by type', async ({ perf, perfReporter }) => {
    const metrics = await perf.collect('SauceDemo · Inventory · resources');
    await perfReporter.record(metrics);

    expect(metrics.resources.count).toBeGreaterThan(0);
    expect(metrics.resources.transferBytes).toBeGreaterThan(0);
    // The by-type buckets are sorted descending by transferred bytes.
    const sorted = [...metrics.resources.byType].sort((a, b) => b.transferBytes - a.transferBytes);
    expect(metrics.resources.byType).toEqual(sorted);
  });
});
