/**
 * --------------------------------------------------------
 * File: journey.visual.spec.ts
 * Module: Visual Regression Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: PDP, order-confirmation, and login-error visual stability.
 * Business Scenario: Key journey screens must not regress visually.
 * Preconditions: Stored auth for PDP/confirmation; logged-out for login-error.
 * Test Strategy: Full-page baselines via the `visual` comparator.
 * Expected Outcome: Captures match the committed baselines for this platform.
 * Priority: Low
 * Tags: @visual @regression
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';
import { CheckoutBuilder } from '@builders/index';

test.describe('SauceDemo · Journey screens · Visual (authenticated) @visual @regression', () => {
  // The visual project does not run the auth `setup`, so authenticate inline.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
  });

  test('the product detail page matches the baseline', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
    visual,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.openProduct('Sauce Labs Backpack');
    await sauceProductDetailsPage.isLoaded();
    await visual.expectPage('saucedemo-pdp-backpack');
  });

  test('the order confirmation page matches the baseline', async ({ checkoutFlow, visual }) => {
    await checkoutFlow.purchase(['Sauce Labs Backpack'], CheckoutBuilder.valid().build());
    await visual.expectPage('saucedemo-order-confirmation');
  });
});

test.describe('SauceDemo · Login error · Visual (logged-out) @visual @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('the login error state matches the baseline', async ({ sauceLoginPage, visual }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.login({ username: 'locked_out_user', password: 'secret_sauce' });
    await visual.expectPage('saucedemo-login-error');
  });
});
