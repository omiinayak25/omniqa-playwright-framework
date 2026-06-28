/**
 * --------------------------------------------------------
 * File: login.data-driven.spec.ts
 * Module: UI Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login across multiple user types (data-driven).
 * Business Scenario: Different user accounts must produce the expected login outcome.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: Data-driven (one test body, many rows) with Playwright annotations.
 * Expected Outcome: Each user resolves to its expected success/error outcome.
 * Priority: Medium
 * Tags: @ui @regression
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Data-driven login — one test definition, many data rows. Demonstrates a
 * data provider + Playwright annotations. Starts logged-out. Tagged @ui.
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/index';

test.use({ storageState: { cookies: [], origins: [] } });

interface LoginCase {
  readonly username: string;
  readonly expect: 'success' | 'error';
  readonly errorContains?: string;
  readonly note?: string;
}

// The "data provider" — a single source of truth for login scenarios.
const LOGIN_CASES: readonly LoginCase[] = [
  { username: 'standard_user', expect: 'success' },
  { username: 'problem_user', expect: 'success', note: 'known UI glitches but logs in' },
  { username: 'performance_glitch_user', expect: 'success', note: 'slow but valid' },
  { username: 'locked_out_user', expect: 'error', errorContains: 'locked out' },
];

test.describe('SauceDemo · Data-driven login @ui @regression', () => {
  for (const data of LOGIN_CASES) {
    test(`${data.username} → ${data.expect}`, async ({ sauceLoginPage, page }) => {
      if (data.note) test.info().annotations.push({ type: 'note', description: data.note });
      if (data.username === 'performance_glitch_user') test.slow();

      await sauceLoginPage.open();
      await sauceLoginPage.login({
        username: data.username,
        password: config.ui.sauceDemo.credentials.password,
      });

      if (data.expect === 'success') {
        await expect(page).toHaveURL(new RegExp(`${SAUCEDEMO_ROUTES.INVENTORY}$`));
      } else {
        expect(await sauceLoginPage.errorMessage()).toContain(data.errorContains ?? '');
      }
    });
  }
});
