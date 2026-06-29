/**
 * --------------------------------------------------------
 * File: checkout.totals.spec.ts
 * Module: UI Tests · Checkout (money math)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo order-overview monetary arithmetic.
 * Business Scenario: Subtotal must equal the sum of item prices, tax must be 8%
 *                    of the subtotal, and the total must equal subtotal + tax —
 *                    the figures a customer is charged.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Arithmetic verification across single-item and full-cart cases.
 * Expected Outcome: All totals reconcile to 2-decimal precision.
 * Priority: Critical
 * Tags: @ui @regression @checkout
 *
 * Last Updated: 2026-06-28
 * Notes: Complements checkout.spec.ts (soft totals) with exact, itemised math.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { CheckoutBuilder } from '@builders/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const TAX_RATE = 0.08; // SauceDemo applies 8% sales tax.
const CUSTOMER = CheckoutBuilder.valid().build();
const sum = (xs: number[]): number => Number(xs.reduce((a, b) => a + b, 0).toFixed(2));

test.describe('SauceDemo · Checkout totals @ui @regression @checkout', () => {
  test('subtotal equals the sum of item prices', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt'], CUSTOMER);
    const itemPrices = await sauceCheckoutOverviewPage.itemPrices();
    expect(await sauceCheckoutOverviewPage.subtotal()).toBeCloseTo(sum(itemPrices), 2);
  });

  test('tax is 8% of the subtotal', async ({ checkoutFlow, sauceCheckoutOverviewPage }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'], CUSTOMER);
    const subtotal = await sauceCheckoutOverviewPage.subtotal();
    expect(await sauceCheckoutOverviewPage.tax()).toBeCloseTo(
      Number((subtotal * TAX_RATE).toFixed(2)),
      2,
    );
  });

  test('total equals subtotal plus tax for a single item', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack'], CUSTOMER);
    const subtotal = await sauceCheckoutOverviewPage.subtotal();
    const tax = await sauceCheckoutOverviewPage.tax();
    expect(await sauceCheckoutOverviewPage.total()).toBeCloseTo(subtotal + tax, 2);
  });

  test('totals reconcile for the full six-item cart', async ({
    sauceInventoryPage,
    checkoutFlow,
    sauceCheckoutOverviewPage,
  }) => {
    await sauceInventoryPage.open();
    // Wait for the catalog to render before reading (WebKit settles the
    // client-side navigation later, destroying a too-early read).
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    const allProducts = await sauceInventoryPage.productNames();
    await checkoutFlow.goToOverview(allProducts, CUSTOMER);

    const itemPrices = await sauceCheckoutOverviewPage.itemPrices();
    const subtotal = await sauceCheckoutOverviewPage.subtotal();
    const tax = await sauceCheckoutOverviewPage.tax();
    const total = await sauceCheckoutOverviewPage.total();

    expect(itemPrices).toHaveLength(6);
    expect(subtotal).toBeCloseTo(sum(itemPrices), 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('overview line items and quantities match the order', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
  }) => {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    await checkoutFlow.goToOverview(products, CUSTOMER);

    expect(await sauceCheckoutOverviewPage.itemNamesList()).toEqual(products);
    const quantities = await sauceCheckoutOverviewPage.itemQuantitiesList();
    expect(quantities.every((q) => q === 1)).toBe(true);
  });
});
