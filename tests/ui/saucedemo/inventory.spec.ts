/**
 * --------------------------------------------------------
 * File: inventory.spec.ts
 * Module: UI Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory (catalog, sorting, cart, header component).
 * Business Scenario: An authenticated shopper browses, sorts, and adds items to cart.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json); network access.
 * Test Strategy: Authenticated UI checks demonstrating storage-state reuse.
 * Expected Outcome: Catalog renders, sorting is correct, and cart badge/contents update.
 * Priority: High
 * Tags: @ui @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * SauceDemo inventory tests using STORED AUTH (storage-state reuse).
 *
 * Thanks to the `setup` project, these start already logged in — we navigate
 * straight to the inventory, no login step. Demonstrates auth reuse, the
 * composed header component, sorting, and cart interaction.
 * Tagged @ui @smoke.
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { ProductSort } from '@pages/saucedemo/inventory.page';

// Reuse the session captured by the `setup` project.
test.use({ storageState: SAUCE_AUTH_FILE });

test.describe('SauceDemo · Inventory (authenticated) @ui @smoke', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('shows the full product catalog', async ({ sauceInventoryPage }) => {
    expect(await sauceInventoryPage.itemCount()).toBe(6);
  });

  test('sorts products by price low → high', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.sortBy(ProductSort.PRICE_ASC);
    const prices = await sauceInventoryPage.productPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('adding products updates the cart badge (composed header component)', async ({
    sauceInventoryPage,
  }) => {
    expect(await sauceInventoryPage.header.cartCount()).toBe(0);
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.addToCart('Sauce Labs Bike Light');
    expect(await sauceInventoryPage.header.cartCount()).toBe(2);
  });

  test('cart reflects the added product', async ({ sauceInventoryPage, sauceCartPage }) => {
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();

    expect(await sauceCartPage.itemCount()).toBe(1);
    expect(await sauceCartPage.itemNamesList()).toContain('Sauce Labs Backpack');
  });
});
