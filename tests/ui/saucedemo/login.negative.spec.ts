/**
 * --------------------------------------------------------
 * File: login.negative.spec.ts
 * Module: UI Tests · Authentication
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login — negative & boundary input handling.
 * Business Scenario: Malformed, empty, whitespace, unicode and over-long inputs
 *                    must be rejected with the correct message and never grant access.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Equivalence partitioning + boundary value analysis, data-driven
 *                from the shared EdgeInputFactory (no inline literals).
 * Expected Outcome: Each invalid input keeps the user on login with a real error.
 * Priority: High
 * Tags: @ui @regression @negative @authentication
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Complements login.spec.ts (happy/locked/wrong-password) — these cover the
 * input-validation gaps. Starts logged-out via an empty storage state.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';
import { EdgeInputFactory } from '@factories/index';

// A login test must begin from a clean, unauthenticated session.
test.use({ storageState: { cookies: [], origins: [] } });

const VALID_PASSWORD = config.ui.sauceDemo.credentials.password;

test.describe('SauceDemo · Login negative & boundary inputs @ui @regression @negative', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  // ---- Required-field validation (empty combinations) ----
  for (const pair of EdgeInputFactory.emptyCredentialPairs()) {
    const expected = pair.username === '' ? 'Username is required' : 'Password is required';

    test(`empty (${pair.label}) → "${expected}"`, async ({ sauceLoginPage }) => {
      await sauceLoginPage.login({ username: pair.username, password: pair.password });
      expect(await sauceLoginPage.errorMessage()).toContain(expected);
      expect(await sauceLoginPage.isLoaded()).toBe(true);
    });
  }

  // ---- Whitespace is NOT silently trimmed into a valid username ----
  for (const ws of EdgeInputFactory.whitespace()) {
    test(`whitespace username (${ws.label}) is rejected`, async ({ sauceLoginPage }) => {
      await sauceLoginPage.login({ username: ws.value, password: VALID_PASSWORD });
      // Either "required" (spaces-only) or credential mismatch — never access.
      expect(await sauceLoginPage.isErrorVisible()).toBe(true);
      expect(await sauceLoginPage.isLoaded()).toBe(true);
    });
  }

  // ---- Unicode usernames are handled gracefully (no crash, no access) ----
  for (const u of EdgeInputFactory.unicode()) {
    test(`unicode username (${u.label}) is rejected gracefully`, async ({ sauceLoginPage }) => {
      await sauceLoginPage.login({ username: u.value, password: VALID_PASSWORD });
      expect(await sauceLoginPage.errorMessage()).toContain('Username and password do not match');
    });
  }

  // ---- Boundary: a very long username is bounded and rejected without leak ----
  test('boundary: 256-char username is rejected without error leak', async ({ sauceLoginPage }) => {
    await sauceLoginPage.login({
      username: EdgeInputFactory.longString(256),
      password: VALID_PASSWORD,
    });
    expect(await sauceLoginPage.errorMessage()).toContain('Username and password do not match');
  });

  // ---- Re-login after a failed attempt must succeed ----
  test('valid login succeeds after a failed attempt', async ({
    sauceLoginPage,
    sauceInventoryPage,
    page,
  }) => {
    await sauceLoginPage.login({ username: 'standard_user', password: 'wrong_password' });
    expect(await sauceLoginPage.isErrorVisible()).toBe(true);

    await sauceLoginPage.loginAsStandardUser();
    await expect(page).toHaveURL(/inventory\.html$/);
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  // ---- Error banner is dismissible ----
  test('login error banner can be dismissed', async ({ sauceLoginPage }) => {
    await sauceLoginPage.login({ username: 'standard_user', password: 'wrong_password' });
    expect(await sauceLoginPage.isErrorVisible()).toBe(true);

    await sauceLoginPage.dismissError();
    expect(await sauceLoginPage.isErrorVisible()).toBe(false);
  });
});
