/**
 * --------------------------------------------------------
 * File: login.visual.spec.ts
 * Module: Visual Regression Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM login screen visual stability (Angular SPA).
 * Business Scenario: The HR portal's branded entry screen must not regress;
 *   the live copyright year in the footer must NOT cause false diffs.
 * Preconditions: Network access to the OrangeHRM demo; baselines committed.
 * Test Strategy: Full-page baseline with the dynamic footer MASKED, plus a
 *   focused login-card baseline.
 * Expected Outcome: Captures match the committed baselines; the changing
 *   copyright year is painted over and never trips the comparison.
 * Priority: Medium
 * Tags: @visual @regression
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Demonstrates "ignore dynamic elements": the footer carries a live
 * "© 2005 – <current year>" string, so it is masked via the central
 * DYNAMIC_SELECTORS registry rather than hard-coded in the spec.
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';
import { DYNAMIC_SELECTORS } from '@visual/index';

test.describe('OrangeHRM · Login · Visual @visual @regression', () => {
  test.beforeEach(async ({ orangeLoginPage }) => {
    await orangeLoginPage.open();
    await orangeLoginPage.isLoaded();
  });

  test('full login page matches the baseline (dynamic footer masked)', async ({ visual }) => {
    await visual.expectPage('orangehrm-login-full', {
      maskSelectors: DYNAMIC_SELECTORS.ORANGEHRM_LOGIN,
    });
  });

  test('the login card matches the baseline', async ({ visual, page }) => {
    await visual.expectElement(
      page.locator('.orangehrm-login-branding').first(),
      'orangehrm-login-brand',
    );
  });
});
