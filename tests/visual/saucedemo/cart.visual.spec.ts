/**
 * --------------------------------------------------------
 * File: cart.visual.spec.ts
 * Module: Visual Regression Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart & checkout screens — visual stability.
 * Business Scenario: Layout regressions on the purchase path must be caught.
 * Preconditions: Stored SauceDemo auth; baselines committed under *-snapshots/.
 * Test Strategy: Full-page baselines via the injected `visual` comparator with a
 *                deterministic single-item cart.
 * Expected Outcome: Captures match the committed baselines for this platform.
 * Priority: Low
 * Tags: @visual @regression
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

// The visual project does not run the auth `setup`, so authenticate inline.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Cart & Checkout · Visual @visual @regression', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
  });

  test('the cart page matches the baseline', async ({ sauceInventoryPage, visual }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await visual.expectPage('saucedemo-cart');
  });

  test('the checkout information page matches the baseline', async ({
    sauceInventoryPage,
    sauceCartPage,
    visual,
  }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();
    await visual.expectPage('saucedemo-checkout-info');
  });
});
