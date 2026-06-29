/**
 * --------------------------------------------------------
 * File: responsive.spec.ts
 * Module: UI Tests · Browser Compatibility
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo responsive rendering across viewports.
 * Business Scenario: The store must remain usable on mobile, tablet, and desktop
 *                    widths — login and catalog render and function at each.
 * Preconditions: Network access to SauceDemo.
 * Test Strategy: Data-driven across representative viewports (pairwise: screen ×
 *                screen-size) using setViewportSize.
 * Expected Outcome: Login and inventory render and operate at every viewport.
 * Priority: Medium
 * Tags: @ui @regression @responsive
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';

const VIEWPORTS = [
  { label: 'mobile portrait', width: 375, height: 667 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
] as const;

test.describe('SauceDemo · Responsive login @ui @regression @responsive', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const vp of VIEWPORTS) {
    test(`login renders and works at ${vp.label} (${vp.width}px)`, async ({
      page,
      sauceLoginPage,
      sauceInventoryPage,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await sauceLoginPage.open();
      expect(await sauceLoginPage.isLoaded()).toBe(true);

      await sauceLoginPage.loginAsStandardUser();
      await expect(page).toHaveURL(/inventory\.html$/);
      expect(await sauceInventoryPage.itemCount()).toBe(6);
    });
  }
});

test.describe('SauceDemo · Responsive inventory @ui @regression @responsive', () => {
  test.use({ storageState: SAUCE_AUTH_FILE });

  for (const vp of VIEWPORTS) {
    test(`inventory grid renders at ${vp.label} (${vp.width}px)`, async ({
      page,
      sauceInventoryPage,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await sauceInventoryPage.open();
      expect(await sauceInventoryPage.isLoaded()).toBe(true);
      expect(await sauceInventoryPage.itemCount()).toBe(6);
    });
  }
});
