/**
 * --------------------------------------------------------
 * File: login.negative.spec.ts
 * Module: UI Tests · Authentication
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM login — required-field & invalid-input handling.
 * Business Scenario: Empty submits surface required-field validation; bad
 *                    credentials are rejected without granting access.
 * Preconditions: Clean (logged-out) session; network access to OrangeHRM.
 * Test Strategy: Negative UI authentication via POM on a heavy SPA.
 * Expected Outcome: Required markers shown on empty submit; invalid creds error.
 * Priority: High
 * Tags: @ui @regression @negative @authentication
 *
 * Last Updated: 2026-06-28
 * Notes: Heavy SPA — tests use test.slow() to extend the default timeout.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { EdgeInputFactory } from '@factories/index';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM · Login negative @ui @regression @negative', () => {
  test.beforeEach(async ({ orangeLoginPage }) => {
    test.slow(); // heavy SPA — grant 3x the default timeout
    await orangeLoginPage.open();
    expect(await orangeLoginPage.isLoaded()).toBe(true);
  });

  test('empty submit flags both username and password as required', async ({ orangeLoginPage }) => {
    await orangeLoginPage.submitEmpty();
    // Two inline "Required" messages — one per empty field.
    expect(await orangeLoginPage.requiredFieldErrorCount()).toBe(2);
  });

  test('unknown user is rejected with an error', async ({ orangeLoginPage }) => {
    await orangeLoginPage.login({ username: 'no_such_user', password: 'whatever123' });
    expect(await orangeLoginPage.errorMessage()).toContain('Invalid credentials');
  });

  test('SQLi payload does not bypass authentication', async ({ orangeLoginPage }) => {
    const payload = EdgeInputFactory.sqlInjection()[0]!;
    await orangeLoginPage.login({ username: payload.value, password: payload.value });
    expect(await orangeLoginPage.errorMessage()).toContain('Invalid credentials');
  });
});
