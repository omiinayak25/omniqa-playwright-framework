/**
 * --------------------------------------------------------
 * File: authorization.spec.ts
 * Module: UI Tests · Authorization
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM role-based access & route protection.
 * Business Scenario: An authenticated Admin sees and can open privileged
 *                    modules; an unauthenticated visitor is bounced to login on
 *                    every protected deep-link.
 * Preconditions: Stored Admin auth (.auth/orangehrm.json) for positive cases;
 *                empty storage state for the protection cases.
 * Test Strategy: Positive privilege checks + negative route-protection (security).
 * Expected Outcome: Admin modules visible/openable; protected routes redirect.
 * Priority: High
 * Tags: @ui @regression @authorization
 *
 * Last Updated: 2026-06-28
 * Notes:
 * The public OrangeHRM demo only provisions an Admin account; ESS-role negative
 * checks remain catalogued as Planned (need a provisioned ESS user). Heavy SPA —
 * tests use test.slow().
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

// Core modules an Admin must be authorised to see.
const ADMIN_MODULES = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment'];

test.describe('OrangeHRM · Authorization — Admin privileges @ui @regression @authorization', () => {
  test.use({ storageState: ORANGE_AUTH_FILE });

  test.beforeEach(async ({ orangeDashboardPage }) => {
    test.slow(); // heavy SPA — grant 3x the default timeout
    await orangeDashboardPage.open();
    expect(await orangeDashboardPage.isLoaded()).toBe(true);
  });

  test('@smoke Admin sees the Admin and PIM modules', async ({ orangeDashboardPage }) => {
    expect(await orangeDashboardPage.hasMenuItem('Admin')).toBe(true);
    expect(await orangeDashboardPage.hasMenuItem('PIM')).toBe(true);
  });

  test('Admin side menu exposes the core module set', async ({ orangeDashboardPage }) => {
    const items = await orangeDashboardPage.sideMenuItems();
    for (const mod of ADMIN_MODULES) {
      expect(items).toContain(mod);
    }
  });

  test('Admin can open User Management (Admin module)', async ({ orangeDashboardPage, page }) => {
    await orangeDashboardPage.openMenu('Admin');
    await expect(page).toHaveURL(/viewSystemUsers/);
    expect(await orangeDashboardPage.headerText()).toContain('Admin');
  });

  test('Admin can open the PIM module', async ({ orangeDashboardPage, page }) => {
    await orangeDashboardPage.openMenu('PIM');
    await expect(page).toHaveURL(/viewEmployeeList/);
    expect(await orangeDashboardPage.headerText()).toContain('PIM');
  });
});

test.describe('OrangeHRM · Authorization — route protection @ui @regression @authorization @negative', () => {
  // Force a clean, unauthenticated session.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('dashboard deep-link without a session redirects to login', async ({
    orangeDashboardPage,
    orangeLoginPage,
  }) => {
    test.slow();
    await orangeDashboardPage.open();
    expect(await orangeLoginPage.isLoaded()).toBe(true);
  });

  test('PIM deep-link without a session redirects to login', async ({
    orangePimPage,
    orangeLoginPage,
  }) => {
    test.slow();
    await orangePimPage.open();
    expect(await orangeLoginPage.isLoaded()).toBe(true);
  });
});
