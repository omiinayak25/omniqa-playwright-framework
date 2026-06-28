/**
 * --------------------------------------------------------
 * File: pim-search.spec.ts
 * Module: UI Tests · Search
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM PIM employee name search.
 * Business Scenario: Searching narrows the employee list; a non-matching term
 *                    returns no records.
 * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
 * Test Strategy: Negative search (no-match) proving the filter is applied.
 * Expected Outcome: A nonsense term yields zero records and no rows.
 * Priority: Medium
 * Tags: @ui @regression @search
 *
 * Last Updated: 2026-06-28
 * Notes: Heavy SPA — test.slow(). The bulk of search coverage is the robust
 * DummyJSON API suite (products.search.spec.ts); this proves the UI filter.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: ORANGE_AUTH_FILE });

test.describe('OrangeHRM · PIM search @ui @regression @search', () => {
  test.beforeEach(async ({ orangePimPage }) => {
    test.slow(); // heavy SPA
    await orangePimPage.open();
    await orangePimPage.waitForLoaded();
  });

  test('the unfiltered list shows employee records', async ({ orangePimPage }) => {
    expect(await orangePimPage.recordsFoundCount()).toBeGreaterThan(0);
  });

  test('a non-matching name returns no records', async ({ orangePimPage }) => {
    await orangePimPage.searchByName('Zzzz Nomatch Xyz');
    expect(await orangePimPage.recordsFoundCount()).toBe(0);
    expect(await orangePimPage.table.rowCount()).toBe(0);
  });
});
