/**
 * --------------------------------------------------------
 * File: cart.a11y.spec.ts
 * Module: Accessibility Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart & checkout-information — WCAG 2.1 A/AA.
 * Business Scenario: The purchase path must be operable by assistive tech.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: axe-core scans on the cart and the checkout form.
 * Expected Outcome: No violations; checkout form controls are labelled.
 * Priority: Medium
 * Tags: @a11y @accessibility @regression
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';

// The a11y project does not run the auth `setup`, so authenticate inline from a
// clean session (matching inventory.a11y) rather than relying on a stored file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Cart & Checkout · Accessibility @a11y @accessibility @regression', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    await sauceLoginPage.loginAsStandardUser();
  });

  test('the cart page has no WCAG 2.1 A/AA violations', async ({ sauceInventoryPage, a11y }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await a11y.expectNoViolations('SauceDemo · Cart');
  });

  test('the checkout information form has no violations', async ({
    sauceInventoryPage,
    sauceCartPage,
    a11y,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();
    await a11y.expectNoViolations('SauceDemo · Checkout info');
  });

  test('checkout form controls are programmatically labelled', async ({
    sauceInventoryPage,
    sauceCartPage,
    a11y,
  }) => {
    await sauceInventoryPage.open();
    await sauceInventoryPage.addToCart('Sauce Labs Backpack');
    await sauceInventoryPage.header.openCart();
    await sauceCartPage.proceedToCheckout();
    await a11y.expectAllFieldsLabeled('SauceDemo · Checkout info · labels');
  });
});
