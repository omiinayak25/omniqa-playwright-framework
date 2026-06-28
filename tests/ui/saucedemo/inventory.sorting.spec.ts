/**
 * --------------------------------------------------------
 * File: inventory.sorting.spec.ts
 * Module: UI Tests · Inventory
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo inventory sort order (all four options).
 * Business Scenario: A shopper sorts the catalog by name or price; the order
 *                    must be exactly correct each way.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Decision-table over the ProductSort options; verify ordering.
 * Expected Outcome: Each sort option produces the correctly ordered list.
 * Priority: High
 * Tags: @ui @regression @inventory
 *
 * Last Updated: 2026-06-28
 * Notes: Complements inventory.spec.ts (which covers only price low→high).
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { ProductSort } from '@pages/saucedemo/inventory.page';

test.use({ storageState: SAUCE_AUTH_FILE });

test.describe('SauceDemo · Inventory sorting @ui @regression @inventory', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('default sort is name A→Z', async ({ sauceInventoryPage }) => {
    expect(await sauceInventoryPage.selectedSort()).toBe(ProductSort.NAME_ASC);
    const names = await sauceInventoryPage.productNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sort name A→Z orders names ascending', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.sortBy(ProductSort.NAME_ASC);
    const names = await sauceInventoryPage.productNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sort name Z→A orders names descending', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.sortBy(ProductSort.NAME_DESC);
    const names = await sauceInventoryPage.productNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sort price high→low orders prices descending', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.sortBy(ProductSort.PRICE_DESC);
    const prices = await sauceInventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sort price low→high orders prices ascending', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.sortBy(ProductSort.PRICE_ASC);
    const prices = await sauceInventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
