/**
 * --------------------------------------------------------
 * File: login.visual.spec.ts
 * Module: Visual Regression Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login screen — pixel-level visual stability.
 * Business Scenario: Unintended CSS/markup changes to the first screen users
 *   see must be caught before release.
 * Preconditions: Clean (logged-out) session; baselines committed under
 *   `*-snapshots/` (regenerate with `--update-snapshots`).
 * Test Strategy: Full-page baseline + a focused login-form element baseline,
 *   both via the injected `visual` comparator (freeze stylesheet + tolerance).
 * Expected Outcome: Captures match the committed baselines for this
 *   project+platform.
 * Priority: Medium
 * Tags: @visual @regression
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Runs WITHOUT stored auth so the snapshot always shows the logged-out screen.
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Login · Visual @visual @regression', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
  });

  test('full login page matches the baseline', async ({ visual }) => {
    await visual.expectPage('saucedemo-login-full');
  });

  test('the login form component matches the baseline', async ({ visual, page }) => {
    await visual.expectElement(page.locator('.login-box'), 'saucedemo-login-form');
  });
});
