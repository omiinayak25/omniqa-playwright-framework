/**
 * --------------------------------------------------------
 * File: cart.data.spec.ts
 * Module: UI Tests · Shopping Cart (data-driven)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Add/remove round-trip for EVERY catalog product.
 * Business Scenario: Each product must be individually addable to and removable
 *                    from the cart with an accurate badge.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Data-driven across all six products.
 * Expected Outcome: Each product adds (badge 1) then removes (badge 0) cleanly.
 * Priority: Medium
 * Tags: @ui @regression @cart
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCE_PRODUCTS } from '@constants/index';

test.use({ storageState: SAUCE_AUTH_FILE });

test.describe('SauceDemo · Cart add/remove per product @ui @regression @cart', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  for (const product of SAUCE_PRODUCTS) {
    test(`"${product}" can be added and removed`, async ({ sauceInventoryPage, sauceCartPage }) => {
      await sauceInventoryPage.addToCart(product);
      expect(await sauceInventoryPage.header.cartCount()).toBe(1);

      await sauceInventoryPage.header.openCart();
      expect(await sauceCartPage.itemNamesList()).toContain(product);

      await sauceCartPage.removeItem(product);
      expect(await sauceCartPage.itemCount()).toBe(0);
      expect(await sauceCartPage.header.cartCount()).toBe(0);
    });
  }
});
