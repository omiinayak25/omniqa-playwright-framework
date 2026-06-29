/**
 * --------------------------------------------------------
 * File: inventory.cart.spec.ts
 * Module: UI Tests · Inventory
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory → cart interactions & badge math.
 * Business Scenario: Adding/removing on the inventory must keep the cart badge
 *                    exact and toggle the card button; Reset App State clears all.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Boundary (0 / all 6) + state-toggle verification.
 * Expected Outcome: Badge count is always exact; reset returns to a clean state.
 * Priority: High
 * Tags: @ui @regression @inventory
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: SAUCE_AUTH_FILE });

const BACKPACK = 'Sauce Labs Backpack';

test.describe('SauceDemo · Inventory cart interactions @ui @regression @inventory', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    // Each test starts from a fresh context (stored auth = empty cart), so no
    // reset is needed here; the explicit reset test exercises resetAppState.
  });

  test('add toggles the card button to "Remove"', async ({ sauceInventoryPage }) => {
    expect(await sauceInventoryPage.cartButtonLabel(BACKPACK)).toBe('Add to cart');
    await sauceInventoryPage.addToCart(BACKPACK);
    expect(await sauceInventoryPage.cartButtonLabel(BACKPACK)).toBe('Remove');
  });

  test('remove on the inventory decrements the badge', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    expect(await sauceInventoryPage.header.cartCount()).toBe(1);

    await sauceInventoryPage.removeFromCart(BACKPACK);
    expect(await sauceInventoryPage.header.cartCount()).toBe(0);
    expect(await sauceInventoryPage.cartButtonLabel(BACKPACK)).toBe('Add to cart');
  });

  test('adding all six products sets the badge to 6', async ({ sauceInventoryPage }) => {
    const names = await sauceInventoryPage.productNames();
    for (const name of names) {
      await sauceInventoryPage.addToCart(name);
    }
    expect(await sauceInventoryPage.header.cartCount()).toBe(6);
  });

  test('Reset App State clears the cart badge', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.addToCart('Sauce Labs Bike Light');
    expect(await sauceInventoryPage.header.cartCount()).toBe(2);

    await sauceInventoryPage.header.resetAppState();
    expect(await sauceInventoryPage.header.cartCount()).toBe(0);
  });
});
