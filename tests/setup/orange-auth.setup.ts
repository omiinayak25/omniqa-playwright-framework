/**
 * --------------------------------------------------------
 * File: orange-auth.setup.ts
 * Module: Auth Setup
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM authentication bootstrap (storage-state capture).
 * Business Scenario: Log in once and persist the admin session for reuse by UI specs.
 * Preconditions: Network access to OrangeHRM; OrangeHRM page objects available.
 * Test Strategy: One-time setup project that saves authenticated storage state.
 * Expected Outcome: Authenticated session is persisted to .auth/orangehrm.json.
 * Priority: Critical
 * Tags: (none — Playwright setup project)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Heavy SPA — marked setup.slow(); runs in the `setup` project before UI specs.
 * --------------------------------------------------------
 *
 * OrangeHRM authentication setup (runs in the `setup` project).
 * Logs in once and persists the session to `.auth/orangehrm.json` for reuse.
 */
import { test as setup, expect } from '@playwright/test';
import { OrangeLoginPage } from '@pages/orangehrm/login.page';
import { OrangeDashboardPage } from '@pages/orangehrm/dashboard.page';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';
import { logger } from '@utils/logger';

setup('authenticate OrangeHRM admin', async ({ page }) => {
  setup.slow(); // heavy SPA
  // The public OrangeHRM demo cold-starts slowly from CI runners; allow well
  // beyond the default 30s navigation timeout so the bootstrap doesn't flake.
  page.setDefaultNavigationTimeout(90_000);
  logger.info('[orange-auth.setup] Authenticating OrangeHRM admin');
  const loginPage = new OrangeLoginPage(page);
  const dashboard = new OrangeDashboardPage(page);

  await loginPage.open();
  await loginPage.loginAsAdmin();
  expect(await dashboard.isLoaded()).toBe(true);

  await page.context().storageState({ path: ORANGE_AUTH_FILE });
  logger.info(`[orange-auth.setup] Saved storage state -> ${ORANGE_AUTH_FILE}`);
});
