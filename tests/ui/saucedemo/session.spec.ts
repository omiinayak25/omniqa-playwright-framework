/**
 * --------------------------------------------------------
 * File: session.spec.ts
 * Module: UI Tests · Authentication (Session)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo session lifecycle — persistence & protection.
 * Business Scenario: An authenticated session survives refresh and is shared
 *                    across tabs in the same context; after logout (or with no
 *                    session) protected pages must not be served.
 * Preconditions: Stored auth (.auth/saucedemo.json) for authenticated cases;
 *                empty storage state for the protection case.
 * Test Strategy: State-transition testing (logged-in → refreshed → logged-out).
 * Expected Outcome: Session persists where expected; protected routes blocked.
 * Priority: High
 * Tags: @ui @regression @authentication
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';

test.describe('SauceDemo · Authenticated session @ui @regression', () => {
  // Reuse the session captured by the `setup` project.
  test.use({ storageState: SAUCE_AUTH_FILE });

  test('session persists across a page refresh', async ({ sauceInventoryPage, page }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    expect(await sauceInventoryPage.itemCount()).toBe(6);
  });

  test('session is shared across a second tab in the same context', async ({
    sauceInventoryPage,
    context,
  }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);

    const secondTab = await context.newPage();
    const inventoryOnSecondTab = new SauceInventoryPage(secondTab);
    await inventoryOnSecondTab.open();
    expect(await inventoryOnSecondTab.isLoaded()).toBe(true);
    await secondTab.close();
  });

  test('after logout, the catalog is no longer served', async ({
    sauceInventoryPage,
    sauceLoginPage,
  }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);

    await sauceInventoryPage.header.logout();
    expect(await sauceLoginPage.isLoaded()).toBe(true);

    // Direct navigation back to the protected page must NOT render the catalog.
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(false);
  });
});

test.describe('SauceDemo · Unauthenticated protection @ui @regression @negative', () => {
  // Force a clean, unauthenticated session.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('protected catalog is blocked without a session', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.open();
    expect(await sauceInventoryPage.isLoaded()).toBe(false);
  });
});
