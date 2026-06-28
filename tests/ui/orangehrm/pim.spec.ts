/**
 * --------------------------------------------------------
 * File: pim.spec.ts
 * Module: UI Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM PIM employee grid (DataTable + Pagination components).
 * Business Scenario: The employee grid renders records and supports pagination.
 * Preconditions: Stored OrangeHRM auth (.auth/orangehrm.json); network access.
 * Test Strategy: Component-driven UI checks on a real data grid.
 * Expected Outcome: Grid renders rows; pagination is present/navigable when needed.
 * Priority: Medium
 * Tags: @ui @regression @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Heavy SPA — uses test.slow(); pagination assertions are conditional on record count.
 * --------------------------------------------------------
 *
 * OrangeHRM PIM — exercises the reusable DataTable + Pagination components on
 * a real data grid, using stored OrangeHRM auth. Tagged @ui @regression.
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: ORANGE_AUTH_FILE });

test.describe('OrangeHRM · PIM employee grid @ui @regression', () => {
  test.beforeEach(async ({ orangePimPage }) => {
    test.slow(); // heavy SPA
    await orangePimPage.open();
    await orangePimPage.waitForLoaded();
  });

  test('@smoke employee grid renders rows (Table component)', async ({ orangePimPage }) => {
    expect(await orangePimPage.table.rowCount()).toBeGreaterThan(0);
    expect(await orangePimPage.recordsFoundCount()).toBeGreaterThan(0);
  });

  test('pagination control is present and navigable (Pagination component)', async ({
    orangePimPage,
  }) => {
    const records = await orangePimPage.recordsFoundCount();
    if (records > 50) {
      expect(await orangePimPage.pagination.isPresent()).toBe(true);
      expect(await orangePimPage.pagination.pageCount()).toBeGreaterThan(1);
      await orangePimPage.pagination.goToPage(2);
      await orangePimPage.waitForLoaded();
      expect(await orangePimPage.table.rowCount()).toBeGreaterThan(0);
    } else {
      test.info().annotations.push({
        type: 'note',
        description: `Only ${records} records — single page; pagination not required`,
      });
      expect(records).toBeGreaterThan(0);
    }
  });
});
