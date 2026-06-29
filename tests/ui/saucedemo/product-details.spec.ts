/**
 * --------------------------------------------------------
 * File: product-details.spec.ts
 * Module: UI Tests · Inventory (PDP)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo Product Detail Page (PDP).
 * Business Scenario: Opening a product shows its correct details, the shopper
 *                    can add it to the cart from the PDP, and return to the list.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Cross-screen consistency (listing ↔ PDP) + PDP cart action.
 * Expected Outcome: PDP fields match the listing; add-to-cart updates the badge.
 * Priority: High
 * Tags: @ui @regression @inventory
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: SAUCE_AUTH_FILE });

const PRODUCTS_UNDER_TEST = ['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt'];

test.describe('SauceDemo · Product Detail Page @ui @regression @inventory', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  for (const product of PRODUCTS_UNDER_TEST) {
    test(`PDP for "${product}" matches its listing`, async ({
      sauceInventoryPage,
      sauceProductDetailsPage,
    }) => {
      // Capture the listing's price for the product before navigating.
      const names = await sauceInventoryPage.productNames();
      const prices = await sauceInventoryPage.productPrices();
      const listedPrice = prices[names.indexOf(product)];

      await sauceInventoryPage.openProduct(product);
      expect(await sauceProductDetailsPage.isLoaded()).toBe(true);

      expect(await sauceProductDetailsPage.productName()).toBe(product);
      expect(await sauceProductDetailsPage.productPrice()).toBe(listedPrice);
      expect((await sauceProductDetailsPage.productDescription()).length).toBeGreaterThan(0);
      expect(await sauceProductDetailsPage.imageSource()).toBeTruthy();
    });
  }

  test('add to cart from the PDP updates the badge', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
  }) => {
    await sauceInventoryPage.openProduct('Sauce Labs Backpack');
    expect(await sauceProductDetailsPage.isLoaded()).toBe(true);
    expect(await sauceProductDetailsPage.actionButtonLabel()).toBe('Add to cart');

    await sauceProductDetailsPage.addToCart();
    expect(await sauceProductDetailsPage.actionButtonLabel()).toBe('Remove');
    expect(await sauceProductDetailsPage.header.cartCount()).toBe(1);
  });

  test('back to products returns to the inventory', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
  }) => {
    await sauceInventoryPage.openProduct('Sauce Labs Backpack');
    expect(await sauceProductDetailsPage.isLoaded()).toBe(true);

    await sauceProductDetailsPage.backToProducts();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    expect(await sauceInventoryPage.itemCount()).toBe(6);
  });
});
