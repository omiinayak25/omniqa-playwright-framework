/**
 * --------------------------------------------------------
 * File: login.spec.ts
 * Module: UI Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login (positive, locked-out, invalid password).
 * Business Scenario: Valid users reach inventory; locked/invalid users are rejected.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Positive + negative UI authentication via POM (assertions in spec).
 * Expected Outcome: standard_user reaches inventory; bad cases show correct errors.
 * Priority: High
 * Tags: @ui @regression @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Forces an unauthenticated storage state so a login test starts logged-out.
 * --------------------------------------------------------
 *
 * SauceDemo login UI tests.
 *
 * Runs WITHOUT stored auth (a login test must start logged-out). All
 * assertions live HERE, never in the page objects. Tagged @ui @regression.
 */
import { test, expect } from '@fixtures/index';
import { SAUCEDEMO_ROUTES } from '@constants/index';
import { config } from '@config/config';

// A login test must begin from a clean, unauthenticated session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo · Login @ui @regression', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  test('@smoke standard_user logs in and reaches the inventory', async ({
    sauceLoginPage,
    sauceInventoryPage,
    page,
  }) => {
    await sauceLoginPage.loginAsStandardUser();

    await expect(page).toHaveURL(new RegExp(`${SAUCEDEMO_ROUTES.INVENTORY}$`));
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    expect(await sauceInventoryPage.itemCount()).toBeGreaterThan(0);
  });

  test('locked_out_user is rejected with an error', async ({ sauceLoginPage }) => {
    await sauceLoginPage.login({
      username: 'locked_out_user',
      password: config.ui.sauceDemo.credentials.password,
    });

    expect(await sauceLoginPage.errorMessage()).toContain('locked out');
  });

  test('invalid password is rejected', async ({ sauceLoginPage }) => {
    await sauceLoginPage.login({ username: 'standard_user', password: 'wrong_password' });

    expect(await sauceLoginPage.errorMessage()).toContain('Username and password do not match');
  });
});
