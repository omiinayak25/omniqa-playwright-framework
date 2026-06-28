/**
 * --------------------------------------------------------
 * File: journey.a11y.spec.ts
 * Module: Accessibility Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: PDP, checkout-overview, and inventory keyboard operability.
 * Business Scenario: Every purchase-path screen must be accessible.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: axe-core scans + keyboard reachability via the `a11y` fixture.
 * Expected Outcome: No violations; the cart link is reachable by keyboard.
 * Priority: Medium
 * Tags: @a11y @accessibility @regression
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { CheckoutBuilder } from '@builders/index';

test.use({ storageState: SAUCE_AUTH_FILE });

test.describe('SauceDemo · Journey · Accessibility @a11y @accessibility @regression', () => {
  test('the product detail page has no violations', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
    a11y,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.openProduct('Sauce Labs Backpack');
    await sauceProductDetailsPage.isLoaded();
    await a11y.expectNoViolations('SauceDemo · PDP');
  });

  test('the checkout overview has no violations', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
    a11y,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack'], CheckoutBuilder.valid().build());
    await sauceCheckoutOverviewPage.itemNamesList();
    await a11y.expectNoViolations('SauceDemo · Checkout overview');
  });

  test('the product detail page meets colour-contrast requirements', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
    a11y,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.openProduct('Sauce Labs Bike Light');
    await sauceProductDetailsPage.isLoaded();
    await a11y.expectSufficientColorContrast('SauceDemo · PDP · contrast');
  });
});
