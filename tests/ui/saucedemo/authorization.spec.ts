/**
 * --------------------------------------------------------
 * File: authorization.spec.ts
 * Module: UI Tests · Authorization
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo protected-route access control.
 * Business Scenario: Cart and checkout pages must never be served to an
 *                    unauthenticated visitor who navigates to them directly.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Negative route-protection (deep-link without a session).
 * Expected Outcome: Each protected deep-link bounces back to the login screen.
 * Priority: High
 * Tags: @ui @regression @authorization @negative
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Authorization — protected routes @ui @regression @authorization @negative', () => {
  test('cart deep-link without a session is not served', async ({
    sauceCartPage,
    sauceLoginPage,
  }) => {
    await sauceCartPage.open();
    // SauceDemo bounces protected pages back to the login screen.
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  test('checkout (step one) deep-link without a session is not served', async ({
    sauceCheckoutInfoPage,
    sauceLoginPage,
  }) => {
    await sauceCheckoutInfoPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  test('checkout (overview) deep-link without a session is not served', async ({
    sauceCheckoutOverviewPage,
    sauceLoginPage,
  }) => {
    await sauceCheckoutOverviewPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });
});
