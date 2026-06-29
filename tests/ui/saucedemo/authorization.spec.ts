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
import type { Page } from '@playwright/test';
import { test, expect } from '@fixtures/index';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Authorization — protected routes @ui @regression @authorization @negative', () => {
  // SauceDemo bounces a protected deep-link to login and shows this access error.
  // A web-first assertion auto-waits for the redirect (WebKit redirects slower
  // than Chromium, so a one-shot isLoaded() check is flaky).
  const accessError = (page: Page) =>
    expect(page.locator('[data-test="error"]')).toContainText('you are logged in');

  test('cart deep-link without a session is not served', async ({ sauceCartPage, page }) => {
    await sauceCartPage.open();
    await accessError(page);
  });

  test('checkout (step one) deep-link without a session is not served', async ({
    sauceCheckoutInfoPage,
    page,
  }) => {
    await sauceCheckoutInfoPage.open();
    await accessError(page);
  });

  test('checkout (overview) deep-link without a session is not served', async ({
    sauceCheckoutOverviewPage,
    page,
  }) => {
    await sauceCheckoutOverviewPage.open();
    await accessError(page);
  });
});
