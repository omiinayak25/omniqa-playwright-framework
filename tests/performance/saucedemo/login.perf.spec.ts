/**
 * --------------------------------------------------------
 * File: login.perf.spec.ts
 * Module: Performance Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login screen — load-performance smoke.
 * Business Scenario: The entry screen must load within an agreed budget; a
 *   gross regression (slow TTFB, bloated payload) must fail the build.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Capture Navigation/Paint/LCP/Resource timings via the
 *   injected `perfAssert`/`perf` fixtures and gate them against a budget.
 * Expected Outcome: Metrics are within budget; network + resource timing are
 *   captured and reported.
 * Priority: Medium
 * Tags: @perf @smoke
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Budgets are intentionally generous (smoke = catch gross regressions, not
 * micro-jitter). Observed locally: load ≈ 1.0s, FCP ≈ 0.5s, LCP ≈ 1.0s.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import type { PerformanceBudget } from '@performance/index';

test.use({ storageState: { cookies: [], origins: [] } });

const BUDGET: PerformanceBudget = {
  maxTtfbMs: 1_500,
  maxDomContentLoadedMs: 3_000,
  maxLoadMs: 4_000,
  maxFcpMs: 2_500,
  maxLcpMs: 3_000,
  maxTransferBytes: 1_048_576, // 1 MB
  maxResourceCount: 30,
};

test.describe('SauceDemo · Login · Performance @perf', () => {
  test.beforeEach(async ({ sauceLoginPage, page }) => {
    await sauceLoginPage.open();
    await page.waitForLoadState('load');
  });

  test('@smoke login screen loads within budget', async ({ perfAssert }) => {
    await perfAssert.expectWithinBudget('SauceDemo · Login', BUDGET);
  });

  test('network and resource timing are captured', async ({ perf, perfReporter }) => {
    const metrics = await perf.collect('SauceDemo · Login · timing');
    await perfReporter.record(metrics);

    // Navigation timing populated.
    expect(metrics.loadMs).toBeGreaterThan(0);
    expect(metrics.ttfbMs).toBeGreaterThan(0);
    // Network phase breakdown present (DNS/TCP/request/response).
    expect(metrics.network.responseMs).toBeGreaterThanOrEqual(0);
    // Resource timing aggregated.
    expect(metrics.resources.count).toBeGreaterThan(0);
    expect(metrics.resources.byType.length).toBeGreaterThan(0);
  });
});
