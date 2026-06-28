/**
 * --------------------------------------------------------
 * File: checkout.data.spec.ts
 * Module: UI Tests · Checkout (data-driven)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: End-to-end purchase of EVERY catalog product.
 * Business Scenario: Each product must be individually purchasable through the
 *                    full checkout flow.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Data-driven across all six products via the CheckoutFlow facade.
 * Expected Outcome: Each single-product order reaches the confirmation page.
 * Priority: Medium
 * Tags: @ui @regression @checkout
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCE_PRODUCTS } from '@constants/index';
import { CheckoutBuilder } from '@builders/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const CUSTOMER = CheckoutBuilder.valid().build();

test.describe('SauceDemo · Purchase each product @ui @regression @checkout', () => {
  for (const product of SAUCE_PRODUCTS) {
    test(`"${product}" can be purchased end-to-end`, async ({ checkoutFlow }) => {
      const confirmation = await checkoutFlow.purchase([product], CUSTOMER);
      expect(confirmation).toContain('Thank you for your order');
    });
  }
});
