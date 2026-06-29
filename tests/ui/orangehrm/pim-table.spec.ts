/**
 * --------------------------------------------------------
 * File: pim-table.spec.ts
 * Module: UI Tests · Tables
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM PIM data grid (DataTable component).
 * Business Scenario: The employee grid must show headers, populated cells, an
 *                    accurate record count, and support row selection.
 * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
 * Test Strategy: Component-driven grid assertions (headers/cells/selection).
 * Expected Outcome: Headers/cells present; counts consistent; selection works.
 * Priority: Medium
 * Tags: @ui @regression @tables
 *
 * Last Updated: 2026-06-28
 * Notes: Heavy SPA — test.slow(). Complements pim.spec.ts (rows + pagination).
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

// PIM grid column indices (0 = selection checkbox).
const COL_FIRST_NAME = 2;

test.use({ storageState: ORANGE_AUTH_FILE });

test.describe('OrangeHRM · PIM data grid @ui @regression @tables', () => {
  test.beforeEach(async ({ orangePimPage }) => {
    test.slow(); // heavy SPA
    await orangePimPage.open();
    await orangePimPage.waitForLoaded();
  });

  test('@smoke the record count is at least the number of visible rows', async ({
    orangePimPage,
  }) => {
    const records = await orangePimPage.recordsFoundCount();
    const rows = await orangePimPage.table.rowCount();
    expect(rows).toBeGreaterThan(0);
    expect(records).toBeGreaterThanOrEqual(rows);
  });

  test('the grid shows the expected column headers', async ({ orangePimPage }) => {
    const headers = await orangePimPage.table.columnHeaders();
    expect(headers.some((h) => h.includes('Last Name'))).toBe(true);
    expect(headers.some((h) => h.includes('Job Title'))).toBe(true);
  });

  test('the first row has populated id and name cells', async ({ orangePimPage }) => {
    expect((await orangePimPage.table.cellText(0, 1)).length).toBeGreaterThan(0); // Id
    expect((await orangePimPage.table.cellText(0, COL_FIRST_NAME)).length).toBeGreaterThan(0);
  });

  test('every first-name cell on the page is non-empty', async ({ orangePimPage }) => {
    const names = await orangePimPage.table.columnValues(COL_FIRST_NAME);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.trim().length > 0)).toBe(true);
  });

  test('selecting a row checks exactly one checkbox', async ({ orangePimPage }) => {
    expect(await orangePimPage.table.selectedRowCount()).toBe(0);
    await orangePimPage.table.selectRow(0);
    expect(await orangePimPage.table.selectedRowCount()).toBe(1);
  });

  test('select-all checks every row on the page', async ({ orangePimPage }) => {
    const rows = await orangePimPage.table.rowCount();
    await orangePimPage.table.selectAll();
    expect(await orangePimPage.table.selectedRowCount()).toBe(rows);
  });
});
