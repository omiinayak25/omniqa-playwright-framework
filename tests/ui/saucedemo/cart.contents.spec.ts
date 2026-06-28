/**
 * --------------------------------------------------------
 * File: cart.contents.spec.ts
 * Module: UI Tests · Shopping Cart
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart line-item integrity (prices, quantity, order).
 * Business Scenario: The cart must show the exact products, prices, and
 *                    quantities the shopper added — wrong figures lose trust/revenue.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Cross-screen price parity + quantity/order/subset assertions.
 * Expected Outcome: Cart prices match the listing; quantity is 1; order preserved.
 * Priority: High
 * Tags: @ui @regression @cart
 *
 * Last Updated: 2026-06-28
 * Notes: Complements cart.feature (add/remove/empty/badge) — no duplication.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: SAUCE_AUTH_FILE });

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

test.describe('SauceDemo · Cart contents integrity @ui @regression @cart', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    await sauceInventoryPage.header.resetAppState();
  });

  test('cart prices match the inventory listing', async ({ sauceInventoryPage, sauceCartPage }) => {
    // Build a name→price map from the listing, then add and compare in the cart.
    const names = await sauceInventoryPage.productNames();
    const prices = await sauceInventoryPage.productPrices();
    const expected = PRODUCTS.map((p) => prices[names.indexOf(p)]);

    for (const p of PRODUCTS) await sauceInventoryPage.addToCart(p);
    await sauceInventoryPage.header.openCart();

    expect(await sauceCartPage.isLoaded()).toBe(true);
    const cartNames = await sauceCartPage.itemNamesList();
    const cartPrices = await sauceCartPage.itemPrices();
    for (const p of PRODUCTS) {
      expect(cartPrices[cartNames.indexOf(p)]).toBe(expected[PRODUCTS.indexOf(p)]);
    }
  });

  test('each cart line has a quantity of 1', async ({ sauceInventoryPage, sauceCartPage }) => {
    for (const p of PRODUCTS) await sauceInventoryPage.addToCart(p);
    await sauceInventoryPage.header.openCart();

    const quantities = await sauceCartPage.itemQuantitiesList();
    expect(quantities).toHaveLength(PRODUCTS.length);
    expect(quantities.every((q) => q === 1)).toBe(true);
  });

  test('cart lists items in the order they were added', async ({
    sauceInventoryPage,
    sauceCartPage,
  }) => {
    for (const p of PRODUCTS) await sauceInventoryPage.addToCart(p);
    await sauceInventoryPage.header.openCart();

    expect(await sauceCartPage.itemNamesList()).toEqual(PRODUCTS);
  });

  test('removing one of three items leaves the other two', async ({
    sauceInventoryPage,
    sauceCartPage,
  }) => {
    for (const p of PRODUCTS) await sauceInventoryPage.addToCart(p);
    await sauceInventoryPage.header.openCart();

    await sauceCartPage.removeItem('Sauce Labs Bike Light');
    expect(await sauceCartPage.itemCount()).toBe(2);
    const remaining = await sauceCartPage.itemNamesList();
    expect(remaining).toContain('Sauce Labs Backpack');
    expect(remaining).toContain('Sauce Labs Bolt T-Shirt');
    expect(remaining).not.toContain('Sauce Labs Bike Light');
    expect(await sauceCartPage.header.cartCount()).toBe(2);
  });

  test('the empty cart shows no items and no badge', async ({
    sauceInventoryPage,
    sauceCartPage,
  }) => {
    await sauceInventoryPage.header.openCart();
    expect(await sauceCartPage.isLoaded()).toBe(true);
    expect(await sauceCartPage.itemCount()).toBe(0);
    expect(await sauceCartPage.header.cartCount()).toBe(0);
  });
});
