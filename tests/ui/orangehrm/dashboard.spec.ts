/**
 * --------------------------------------------------------
 * File: dashboard.spec.ts
 * Module: UI Tests · Dashboard
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM Dashboard landing screen.
 * Business Scenario: After login the dashboard must render its widgets, quick
 *                    launch, identity, and a working menu filter.
 * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
 * Test Strategy: Widget/identity/navigation assertions on the landing screen.
 * Expected Outcome: Header, widgets, quick launch, user, and menu filter work.
 * Priority: Medium
 * Tags: @ui @regression @dashboard
 *
 * Last Updated: 2026-06-28
 * Notes: Heavy SPA — test.slow().
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: ORANGE_AUTH_FILE });

test.describe('OrangeHRM · Dashboard @ui @regression @dashboard', () => {
  test.beforeEach(async ({ orangeDashboardPage }) => {
    test.slow(); // heavy SPA
    await orangeDashboardPage.open();
    expect(await orangeDashboardPage.isLoaded()).toBe(true);
  });

  test('@smoke the dashboard header reads "Dashboard"', async ({ orangeDashboardPage }) => {
    expect(await orangeDashboardPage.headerText()).toContain('Dashboard');
  });

  test('dashboard widgets render', async ({ orangeDashboardPage }) => {
    expect(await orangeDashboardPage.widgetCount()).toBeGreaterThan(0);
  });

  test('the Quick Launch widget is present', async ({ orangeDashboardPage }) => {
    expect(await orangeDashboardPage.hasQuickLaunch()).toBe(true);
  });

  test('the logged-in user is shown in the top bar', async ({ orangeDashboardPage }) => {
    expect((await orangeDashboardPage.loggedInUser()).length).toBeGreaterThan(0);
  });

  test('the side-menu search filters the navigation', async ({ orangeDashboardPage }) => {
    const before = await orangeDashboardPage.sideMenuItems();
    await orangeDashboardPage.filterMenu('Admin');
    const after = await orangeDashboardPage.sideMenuItems();
    expect(after.length).toBeLessThan(before.length);
    expect(after.some((m) => m.includes('Admin'))).toBe(true);
  });
});
