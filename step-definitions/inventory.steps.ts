/**
 * --------------------------------------------------------
 * File: inventory.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory BDD steps (catalog details + sorting).
 * Business Scenario: Gherkin catalog scenarios drive the SauceInventoryPage POM.
 * Preconditions: Authenticated catalog (Background reuses Authentication steps).
 * Test Strategy: BDD step glue reusing the inventory Page Object (no duplication).
 * Expected Outcome: Catalog detail/sort steps map cleanly to page-object reads.
 * Priority: High
 * Tags: (driven by features/inventory/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Inventory step definitions. The sign-in / "I should see the product catalog"
 * / "I should see N products available" steps are REUSED from
 * authentication.steps.ts — only catalog-detail and sorting steps live here.
 * `this` is the per-scenario CustomWorld.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceInventoryPage, ProductSort } from '@pages/saucedemo/inventory.page';
import { SauceProductDetailsPage } from '@pages/saucedemo/product-details.page';
import type { CustomWorld } from '@bdd/world';

// Business-readable sort labels → the Page Object's ProductSort enum.
const SORT_OPTIONS: Readonly<Record<string, ProductSort>> = {
  'Name (A to Z)': ProductSort.NAME_ASC,
  'Name (Z to A)': ProductSort.NAME_DESC,
  'Price (low to high)': ProductSort.PRICE_ASC,
  'Price (high to low)': ProductSort.PRICE_DESC,
};

// ------------------------------------------------------------------- actions
When('I sort the products by {string}', async function (this: CustomWorld, label: string) {
  const option = SORT_OPTIONS[label];
  if (option === undefined) throw new Error(`Unknown sort option: "${label}"`);
  await new SauceInventoryPage(this.page).sortBy(option);
});

// ----------------------------------------------------- product detail (PDP)
When('I open the product {string}', async function (this: CustomWorld, name: string) {
  await new SauceInventoryPage(this.page).openProduct(name);
});

When('I add the displayed product to the cart', async function (this: CustomWorld) {
  await new SauceProductDetailsPage(this.page).addToCart();
});

Then(
  'I should see the product details for {string}',
  async function (this: CustomWorld, name: string) {
    const pdp = new SauceProductDetailsPage(this.page);
    expect(await pdp.isLoaded()).toBe(true);
    expect(await pdp.productName()).toBe(name);
  },
);

Then('the cart badge should show {int}', async function (this: CustomWorld, count: number) {
  expect(await new SauceProductDetailsPage(this.page).header.cartCount()).toBe(count);
});

// ---------------------------------------------------------------- assertions
Then(
  'every product should display a name, a description and a price',
  async function (this: CustomWorld) {
    const inventory = new SauceInventoryPage(this.page);
    const count = await inventory.itemCount();
    const [names, descriptions, prices] = await Promise.all([
      inventory.productNames(),
      inventory.productDescriptions(),
      inventory.productPrices(),
    ]);

    expect(names).toHaveLength(count);
    expect(descriptions).toHaveLength(count);
    expect(prices).toHaveLength(count);
    expect(names.every((n) => n.trim().length > 0)).toBe(true);
    expect(descriptions.every((d) => d.trim().length > 0)).toBe(true);
    expect(prices.every((p) => p > 0)).toBe(true);
  },
);

Then('every product should display an image', async function (this: CustomWorld) {
  const inventory = new SauceInventoryPage(this.page);
  const count = await inventory.itemCount();
  const sources = await inventory.productImageSources();
  expect(sources).toHaveLength(count);
  expect(sources.every((src) => src.trim().length > 0)).toBe(true);
});

Then('every product price should be greater than zero', async function (this: CustomWorld) {
  const prices = await new SauceInventoryPage(this.page).productPrices();
  expect(prices.length).toBeGreaterThan(0);
  expect(prices.every((p) => p > 0)).toBe(true);
});

Then('every product should display a non-empty description', async function (this: CustomWorld) {
  const descriptions = await new SauceInventoryPage(this.page).productDescriptions();
  expect(descriptions.length).toBeGreaterThan(0);
  expect(descriptions.every((d) => d.trim().length > 0)).toBe(true);
});

Then(
  'the products should be ordered by {string}',
  async function (this: CustomWorld, order: string) {
    const inventory = new SauceInventoryPage(this.page);

    if (order === 'name ascending' || order === 'name descending') {
      const names = await inventory.productNames();
      const expected = [...names].sort((a, b) => a.localeCompare(b));
      if (order === 'name descending') expected.reverse();
      expect(names).toEqual(expected);
      return;
    }

    const prices = await inventory.productPrices();
    const expected = [...prices].sort((a, b) => a - b);
    if (order === 'price descending') expected.reverse();
    expect(prices).toEqual(expected);
  },
);
