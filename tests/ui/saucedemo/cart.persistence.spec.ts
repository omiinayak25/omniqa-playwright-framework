/**
 * --------------------------------------------------------
 * File: cart.persistence.spec.ts
 * Module: UI Tests · Shopping Cart
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart persistence & navigation.
 * Business Scenario: The cart must survive a refresh and continued browsing, and
 *                    line items must link to their product detail page.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: State-persistence across refresh/navigation + link integrity.
 * Expected Outcome: Cart contents survive refresh & PDP round-trips; links resolve.
 * Priority: High
 * Tags: @ui @regression @cart
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCEDEMO_ROUTES } from '@constants/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const BACKPACK = 'Sauce Labs Backpack';

test.describe('SauceDemo · Cart persistence & navigation @ui @regression @cart', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('cart contents persist across a page refresh', async ({
    sauceInventoryPage,
    sauceCartPage,
    page,
  }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.header.openCart();
    expect(await sauceCartPage.itemCount()).toBe(1);

    await page.reload({ waitUntil: 'domcontentloaded' });
    expect(await sauceCartPage.isLoaded()).toBe(true);
    expect(await sauceCartPage.itemCount()).toBe(1);
    expect(await sauceCartPage.itemNamesList()).toContain(BACKPACK);
  });

  test('cart survives visiting a product page and returning', async ({
    sauceInventoryPage,
    sauceProductDetailsPage,
    sauceCartPage,
  }) => {
    await sauceInventoryPage.addToCart(BACKPACK);

    // Round-trip through a PDP, then back to the cart.
    await sauceInventoryPage.openProduct('Sauce Labs Bike Light');
    expect(await sauceProductDetailsPage.isLoaded()).toBe(true);
    await sauceProductDetailsPage.backToProducts();
    await sauceInventoryPage.header.openCart();

    expect(await sauceCartPage.itemNamesList()).toContain(BACKPACK);
    expect(await sauceCartPage.header.cartCount()).toBe(1);
  });

  test('continue shopping preserves the cart contents', async ({
    sauceInventoryPage,
    sauceCartPage,
  }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.continueShopping();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);

    await sauceInventoryPage.header.openCart();
    expect(await sauceCartPage.itemNamesList()).toContain(BACKPACK);
    expect(await sauceCartPage.header.cartCount()).toBe(1);
  });

  test('removing the last item empties the cart', async ({ sauceInventoryPage, sauceCartPage }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.removeItem(BACKPACK);

    expect(await sauceCartPage.itemCount()).toBe(0);
    expect(await sauceCartPage.header.cartCount()).toBe(0);
  });

  test('checkout from the cart opens checkout step one', async ({
    sauceInventoryPage,
    sauceCartPage,
    page,
  }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();

    await expect(page).toHaveURL(new RegExp(`${SAUCEDEMO_ROUTES.CHECKOUT_STEP_ONE}$`));
  });

  test('a cart line item links to its product detail page', async ({
    sauceInventoryPage,
    sauceCartPage,
    sauceProductDetailsPage,
  }) => {
    await sauceInventoryPage.addToCart(BACKPACK);
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.openProduct(BACKPACK);

    expect(await sauceProductDetailsPage.isLoaded()).toBe(true);
    expect(await sauceProductDetailsPage.productName()).toBe(BACKPACK);
  });
});
