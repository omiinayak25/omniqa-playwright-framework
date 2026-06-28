/**
 * --------------------------------------------------------
 * File: login.keyboard.spec.ts
 * Module: UI Tests · Authentication (Accessibility)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login — keyboard operability.
 * Business Scenario: A keyboard-only user must be able to sign in; tab order
 *                    must flow username → password → submit.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Accessibility (operable-without-pointer) behavioural checks.
 * Expected Outcome: Keyboard login reaches the inventory; focus order is logical.
 * Priority: Medium
 * Tags: @ui @regression @a11y @authentication
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Login keyboard accessibility @ui @regression @a11y', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  test('a keyboard-only user can sign in', async ({ sauceLoginPage, sauceInventoryPage, page }) => {
    await sauceLoginPage.loginWithKeyboard(config.ui.sauceDemo.credentials);
    await expect(page).toHaveURL(/inventory\.html$/);
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('tab order flows username → password', async ({ page }) => {
    await page.locator('#user-name').focus();
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? '');
    expect(focusedId).toBe('password');
  });
});
