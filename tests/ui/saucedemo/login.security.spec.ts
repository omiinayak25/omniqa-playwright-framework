/**
 * --------------------------------------------------------
 * File: login.security.spec.ts
 * Module: UI Tests · Authentication (Security)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login — security properties of the sign-in form.
 * Business Scenario: Credentials must be masked and never leaked; injection
 *                    payloads must be treated as inert data (no bypass, no exec).
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Error-guessing + OWASP-style probes from the shared
 *                EdgeInputFactory (XSS / SQLi datasets reused across modules).
 * Expected Outcome: Password is masked & absent from the DOM; payloads denied.
 * Priority: High
 * Tags: @ui @regression @security @authentication
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';
import { EdgeInputFactory } from '@factories/index';

test.use({ storageState: { cookies: [], origins: [] } });

const VALID_PASSWORD = config.ui.sauceDemo.credentials.password;

test.describe('SauceDemo · Login security @ui @regression @security', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
    expect(await sauceLoginPage.isLoaded()).toBe(true);
  });

  test('password field masks its value (type=password)', async ({ sauceLoginPage }) => {
    expect(await sauceLoginPage.passwordInputType()).toBe('password');
  });

  test('password is not persisted to client storage after login', async ({
    sauceLoginPage,
    page,
  }) => {
    // NB: SauceDemo prints the demo password as on-page help text, so a DOM
    // scan is meaningless here. The meaningful property is that the secret is
    // never written to local/session storage once authenticated.
    await sauceLoginPage.loginAsStandardUser();
    await expect(page).toHaveURL(/inventory\.html$/);

    const storage = await page.evaluate(() =>
      JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
    );
    expect(storage).not.toContain(VALID_PASSWORD);
  });

  // ---- XSS payloads in the username are treated as inert text, never executed ----
  for (const payload of EdgeInputFactory.xss()) {
    test(`XSS username payload (${payload.label}) is neutralised`, async ({
      sauceLoginPage,
      page,
    }) => {
      let dialogFired = false;
      page.on('dialog', async (d) => {
        dialogFired = true;
        await d.dismiss();
      });

      await sauceLoginPage.login({ username: payload.value, password: VALID_PASSWORD });

      expect(dialogFired).toBe(false); // no alert() executed
      expect(await sauceLoginPage.isLoaded()).toBe(true); // no access granted
    });
  }

  // ---- SQLi payloads in the username must not bypass authentication ----
  for (const payload of EdgeInputFactory.sqlInjection()) {
    test(`SQLi username payload (${payload.label}) does not bypass auth`, async ({
      sauceLoginPage,
    }) => {
      await sauceLoginPage.login({ username: payload.value, password: payload.value });
      expect(await sauceLoginPage.isErrorVisible()).toBe(true);
      expect(await sauceLoginPage.isLoaded()).toBe(true);
    });
  }
});
