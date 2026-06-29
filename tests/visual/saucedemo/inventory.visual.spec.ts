/**
 * --------------------------------------------------------
 * File: inventory.visual.spec.ts
 * Module: Visual Regression Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory (products) screen visual stability.
 * Business Scenario: The product catalogue layout/branding must not regress.
 * Preconditions: Logged-in SauceDemo session (performed inline — the visual
 *   project carries no stored auth); baselines committed.
 * Test Strategy: Full-page product-grid baseline + a focused header-component
 *   baseline.
 * Expected Outcome: Captures match the committed baselines.
 * Priority: Medium
 * Tags: @visual @regression
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Product imagery is served from a CDN; we wait for the inventory to finish
 * loading (page object `isLoaded`) and let the comparator's font/animation
 * freeze + pixel tolerance absorb sub-pixel rendering noise.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Inventory · Visual @visual @regression', () => {
  test.beforeEach(async ({ sauceLoginPage, sauceInventoryPage }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('full inventory page matches the baseline', async ({ visual }) => {
    await visual.expectPage('saucedemo-inventory-full');
  });

  test('the app header matches the baseline', async ({ visual, page }) => {
    await visual.expectElement(page.locator('[data-test="primary-header"]'), 'saucedemo-header');
  });
});
