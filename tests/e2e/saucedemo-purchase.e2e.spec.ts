/**
 * --------------------------------------------------------
 * File: saucedemo-purchase.e2e.spec.ts
 * Module: E2E Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo end-to-end purchase journey.
 * Business Scenario: A shopper browses, carts, checks out, completes, and logs out.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json); network access.
 * Test Strategy: Multi-screen E2E user journey across the UI layer.
 * Expected Outcome: Order confirmation is shown and the user returns to login.
 * Priority: Critical
 * Tags: @e2e @ui
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * E2E · UI journey (SauceDemo).
 * Full user journey across multiple screens: authenticated browse → add to
 * cart → checkout → order complete → logout. Uses stored auth. Tagged @e2e @ui.
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import type { CheckoutInfo } from '@models/user.model';

test.use({ storageState: SAUCE_AUTH_FILE });

const CUSTOMER: CheckoutInfo = { firstName: 'E2E', lastName: 'Buyer', postalCode: '560001' };
const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'] as const;

test.describe('E2E · SauceDemo purchase journey @e2e @ui', () => {
  test('browse → cart → checkout → complete → logout', async ({
    sauceInventoryPage,
    sauceCartPage,
    sauceCheckoutInfoPage,
    sauceCheckoutOverviewPage,
    sauceCheckoutCompletePage,
    sauceLoginPage,
    page,
  }) => {
    // 1 · Browse the catalog
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    expect(await sauceInventoryPage.itemCount()).toBe(6);

    // 2 · Add products and verify the cart badge (composed header component)
    for (const name of PRODUCTS) await sauceInventoryPage.addToCart(name);
    expect(await sauceInventoryPage.header.cartCount()).toBe(PRODUCTS.length);

    // 3 · Verify cart contents
    await sauceInventoryPage.header.openCart();
    expect(await sauceCartPage.itemNamesList()).toEqual([...PRODUCTS]);

    // 4 · Check out the items already in the cart
    await sauceCartPage.proceedToCheckout();
    await sauceCheckoutInfoPage.fillInformation(CUSTOMER);
    await sauceCheckoutInfoPage.continue();
    expect(await sauceCheckoutOverviewPage.itemNamesList()).toHaveLength(PRODUCTS.length);
    await sauceCheckoutOverviewPage.finish();
    expect(await sauceCheckoutCompletePage.confirmationText()).toContain(
      'Thank you for your order',
    );

    // 5 · Logout and verify we are back on the login screen
    await sauceInventoryPage.open();
    await sauceInventoryPage.header.logout();
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });
});
