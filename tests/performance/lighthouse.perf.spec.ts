/**
 * --------------------------------------------------------
 * File: lighthouse.perf.spec.ts
 * Module: Performance Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Lighthouse performance audit (optional, heavy).
 * Business Scenario: A periodic, holistic performance score (beyond raw
 *   timings) gating the agreed minimum.
 * Preconditions: `LIGHTHOUSE_ENABLED=true` and a Chrome/Chromium binary on the
 *   host; otherwise the suite SKIPS (Lighthouse is opt-in, not a per-PR gate).
 * Test Strategy: Run the Lighthouse CLI against the SauceDemo base URL and
 *   assert the performance category score meets `LIGHTHOUSE_MIN_PERF_SCORE`.
 * Expected Outcome: Score ≥ configured minimum, or the test is skipped.
 * Priority: Low (opt-in)
 * Tags: @perf @lighthouse
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Guarded by config so the default suite never depends on Lighthouse being
 * installed/available. Enable deliberately: `LIGHTHOUSE_ENABLED=true`.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';

test.describe('Lighthouse · Performance Audit @perf @lighthouse', () => {
  test('SauceDemo meets the minimum Lighthouse performance score', async ({ lighthouse }) => {
    test.skip(!lighthouse.isEnabled(), 'Lighthouse audit disabled (LIGHTHOUSE_ENABLED=false)');
    // Lighthouse spins up its own Chrome and audits — allow generous time.
    test.setTimeout(120_000);

    const summary = await lighthouse.audit(config.ui.sauceDemo.baseUrl, 'saucedemo-login');

    expect(
      summary.performanceScore,
      `Lighthouse performance score ${summary.performanceScore} < minimum ${lighthouse.minimumScore()}`,
    ).toBeGreaterThanOrEqual(lighthouse.minimumScore());
  });
});
