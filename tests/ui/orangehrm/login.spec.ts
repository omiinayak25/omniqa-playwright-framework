/**
 * --------------------------------------------------------
 * File: login.spec.ts
 * Module: UI Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM login (page-object model on a heavy SPA).
 * Business Scenario: Admin can authenticate; invalid credentials are rejected.
 * Preconditions: Clean (logged-out) session; network access to OrangeHRM.
 * Test Strategy: Positive + negative UI authentication via POM.
 * Expected Outcome: Valid login reaches the dashboard; invalid shows an error.
 * Priority: High
 * Tags: @ui @regression @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Heavy SPA — tests use test.slow() to extend the default timeout.
 * --------------------------------------------------------
 *
 * OrangeHRM login UI tests. Demonstrates the same POM pattern on a second,
 * heavier SPA. Tagged @ui @regression.
 */
import { test, expect } from '@fixtures/index';

// OrangeHRM has no stored auth; start from a clean session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM · Login @ui @regression', () => {
  test('@smoke Admin logs in and reaches the dashboard', async ({
    orangeLoginPage,
    orangeDashboardPage,
  }) => {
    test.slow(); // heavy SPA — grant 3x the default timeout
    await orangeLoginPage.open();
    expect(await orangeLoginPage.isLoaded()).toBe(true);

    await orangeLoginPage.loginAsAdmin();

    expect(await orangeDashboardPage.isLoaded()).toBe(true);
    expect(await orangeDashboardPage.headerText()).toContain('Dashboard');
  });

  test('invalid credentials are rejected', async ({ orangeLoginPage }) => {
    test.slow();
    await orangeLoginPage.open();
    await orangeLoginPage.login({ username: 'Admin', password: 'wrong-password' });

    expect(await orangeLoginPage.errorMessage()).toContain('Invalid credentials');
  });
});
