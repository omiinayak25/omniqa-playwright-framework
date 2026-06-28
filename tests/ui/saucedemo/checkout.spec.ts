/**
 * --------------------------------------------------------
 * File: checkout.spec.ts
 * Module: UI Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout flow (CheckoutFlow business layer + totals).
 * Business Scenario: A shopper completes checkout; totals add up; validation blocks gaps.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json); network access.
 * Test Strategy: Business-flow UI test with soft assertions on totals arithmetic.
 * Expected Outcome: Purchase confirms; subtotal+tax=total; missing postal code is rejected.
 * Priority: High
 * Tags: @ui @e2e
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * SauceDemo checkout — exercises the CheckoutFlow (business-flow layer),
 * soft assertions, and totals arithmetic. Uses stored auth. Tagged @ui @e2e.
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import type { CheckoutInfo } from '@models/user.model';

test.use({ storageState: SAUCE_AUTH_FILE });

const CUSTOMER: CheckoutInfo = {
  firstName: 'Quality',
  lastName: 'Assurance',
  postalCode: '411001',
};

test.describe('SauceDemo · Checkout flow @ui @e2e', () => {
  test('@smoke completes a single-item purchase end-to-end', async ({ checkoutFlow }) => {
    const confirmation = await checkoutFlow.purchase(['Sauce Labs Backpack'], CUSTOMER);
    expect(confirmation).toContain('Thank you for your order');
  });

  test('overview totals: subtotal + tax = total (soft assertions)', async ({
    sauceInventoryPage,
    sauceCartPage,
    sauceCheckoutInfoPage,
    sauceCheckoutOverviewPage,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();
    await sauceCheckoutInfoPage.fillInformation(CUSTOMER);
    await sauceCheckoutInfoPage.continue();

    const subtotal = await sauceCheckoutOverviewPage.subtotal();
    const tax = await sauceCheckoutOverviewPage.tax();
    const total = await sauceCheckoutOverviewPage.total();

    // Soft assertions: collect ALL failures instead of stopping at the first.
    expect.soft(subtotal).toBeGreaterThan(0);
    expect.soft(tax).toBeGreaterThan(0);
    expect.soft(total).toBeCloseTo(subtotal + tax, 2);
    expect.soft(await sauceCheckoutOverviewPage.itemNamesList()).toHaveLength(2);
  });

  test('missing postal code is rejected', async ({
    sauceInventoryPage,
    sauceCartPage,
    sauceCheckoutInfoPage,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();
    await sauceCheckoutInfoPage.fillInformation({ firstName: 'Q', lastName: 'A', postalCode: '' });
    await sauceCheckoutInfoPage.continue();

    expect(await sauceCheckoutInfoPage.errorMessage()).toContain('Postal Code is required');
  });
});
