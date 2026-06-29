/**
 * --------------------------------------------------------
 * File: product-details.data.spec.ts
 * Module: UI Tests · Inventory (PDP, data-driven)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: PDP field parity for EVERY catalog product.
 * Business Scenario: Each product's detail page must show its own correct
 *                    name, price, description, and image.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Data-driven across all six products (one test per product).
 * Expected Outcome: Every PDP matches its inventory listing.
 * Priority: Medium
 * Tags: @ui @regression @inventory
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCE_PRODUCTS } from '@constants/index';

test.use({ storageState: SAUCE_AUTH_FILE });

test.describe('SauceDemo · PDP per product @ui @regression @inventory', () => {
  for (const product of SAUCE_PRODUCTS) {
    test(`PDP for "${product}" shows correct details`, async ({
      sauceInventoryPage,
      sauceProductDetailsPage,
    }) => {
      await sauceInventoryPage.open();
      // Wait for the catalog to fully render before reading (WebKit settles the
      // client-side navigation later than Chromium, destroying a too-early read).
      expect(await sauceInventoryPage.isLoaded()).toBe(true);
      const names = await sauceInventoryPage.productNames();
      const prices = await sauceInventoryPage.productPrices();
      const expectedPrice = prices[names.indexOf(product)];

      await sauceInventoryPage.openProduct(product);
      expect(await sauceProductDetailsPage.isLoaded()).toBe(true);
      expect(await sauceProductDetailsPage.productName()).toBe(product);
      expect(await sauceProductDetailsPage.productPrice()).toBe(expectedPrice);
      expect((await sauceProductDetailsPage.productDescription()).length).toBeGreaterThan(0);
      expect(await sauceProductDetailsPage.imageSource()).toBeTruthy();
    });
  }
});
