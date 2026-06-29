/**
 * --------------------------------------------------------
 * File: auth.setup.ts
 * Module: Auth Setup
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo authentication bootstrap (storage-state capture).
 * Business Scenario: Log in once and persist the session for reuse by UI specs.
 * Preconditions: Network access to SauceDemo; SauceDemo page objects available.
 * Test Strategy: One-time setup project that saves authenticated storage state.
 * Expected Outcome: Authenticated session is persisted to .auth/saucedemo.json.
 * Priority: Critical
 * Tags: (none — Playwright setup project)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Runs as the dependency of the UI projects; not a standalone assertion suite.
 * --------------------------------------------------------
 *
 * Authentication setup project.
 *
 * Runs ONCE before the UI projects (declared as their dependency in
 * playwright.config.ts). Logs into SauceDemo a single time and persists the
 * browser session to `.auth/saucedemo.json`. UI specs that opt in with
 * `test.use({ storageState: SAUCE_AUTH_FILE })` then start already
 * authenticated — no repeated logins (faster, less flaky).
 */
import { test as setup, expect } from '@playwright/test';
import { SauceLoginPage } from '@pages/saucedemo/login.page';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { logger } from '@utils/logger';

setup('authenticate SauceDemo standard_user', async ({ page }) => {
  logger.info('[auth.setup] Authenticating SauceDemo standard_user');
  const loginPage = new SauceLoginPage(page);
  const inventoryPage = new SauceInventoryPage(page);

  await loginPage.open();
  await loginPage.loginAsStandardUser();

  // Confirm we actually reached the authenticated area before saving state.
  await expect(page).toHaveURL(/inventory\.html/);
  expect(await inventoryPage.isLoaded()).toBe(true);

  await page.context().storageState({ path: SAUCE_AUTH_FILE });
  logger.info(`[auth.setup] Saved storage state -> ${SAUCE_AUTH_FILE}`);
});
