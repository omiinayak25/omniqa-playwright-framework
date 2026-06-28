/**
 * --------------------------------------------------------
 * File: products.constants.ts
 * Module: Constants
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Canonical SauceDemo catalog product names — the single source of truth for
 * data-driven product tests (PDP, cart, checkout) so the six product names are
 * never re-typed per spec.
 *
 * Used By:
 * Data-driven SauceDemo UI specs.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */

/** The six products in the SauceDemo catalog (stable across the demo). */
export const SAUCE_PRODUCTS = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
] as const;
