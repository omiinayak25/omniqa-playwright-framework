/**
 * --------------------------------------------------------
 * File: inventory.catalog.spec.ts
 * Module: UI Tests · Inventory
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo product-catalog data integrity.
 * Business Scenario: Every product must show a name, a well-formed price, a
 *                    description, and an accessible image — the trust signals a
 *                    shopper relies on before buying.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Field-completeness + format assertions across all 6 products.
 * Expected Outcome: No blanks, all prices $0.00-formatted & positive, alt text present.
 * Priority: High
 * Tags: @ui @regression @inventory
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: SAUCE_AUTH_FILE });

const EXPECTED_PRODUCTS = 6;
const PRICE_FORMAT = /^\$\d+\.\d{2}$/;

test.describe('SauceDemo · Catalog integrity @ui @regression @inventory', () => {
  test.beforeEach(async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('every product has a non-empty name', async ({ sauceInventoryPage }) => {
    const names = await sauceInventoryPage.productNames();
    expect(names).toHaveLength(EXPECTED_PRODUCTS);
    expect(names.every((n) => n.trim().length > 0)).toBe(true);
  });

  test('every product price is $0.00 formatted', async ({ sauceInventoryPage }) => {
    const labels = await sauceInventoryPage.productPriceLabels();
    expect(labels).toHaveLength(EXPECTED_PRODUCTS);
    for (const label of labels) {
      expect(label).toMatch(PRICE_FORMAT);
    }
  });

  test('every product price is positive', async ({ sauceInventoryPage }) => {
    const prices = await sauceInventoryPage.productPrices();
    expect(prices.every((p) => p > 0)).toBe(true);
  });

  test('every product has a non-empty description', async ({ sauceInventoryPage }) => {
    const descriptions = await sauceInventoryPage.productDescriptions();
    expect(descriptions).toHaveLength(EXPECTED_PRODUCTS);
    expect(descriptions.every((d) => d.trim().length > 0)).toBe(true);
  });

  test('every product image has a resolvable src', async ({ sauceInventoryPage }) => {
    const sources = await sauceInventoryPage.productImageSources();
    expect(sources).toHaveLength(EXPECTED_PRODUCTS);
    for (const src of sources) {
      expect(src).toBeTruthy();
      expect(src).not.toContain('sl-404'); // SauceDemo's broken-image placeholder
    }
  });

  test('every product image has alt text', async ({ sauceInventoryPage }) => {
    const alts = await sauceInventoryPage.productImageAltTexts();
    expect(alts).toHaveLength(EXPECTED_PRODUCTS);
    expect(alts.every((a) => a.trim().length > 0)).toBe(true);
  });
});
