/**
 * --------------------------------------------------------
 * File: pagination.component.ts
 * Module: UI Components
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Reusable wrapper over OrangeHRM's pagination control. Composed into list
 * pages to navigate between result pages and report how many pages exist.
 *
 * Responsibilities:
 * - Detect whether pagination is present on the current screen
 * - Report the count of page-number buttons (excluding prev/next arrows)
 * - Navigate to a 1-based page number
 *
 * Used By:
 * pim.page.ts (OrangePimPage.pagination); any future OrangeHRM list page
 *
 * Dependencies:
 * Playwright (Page, Locator), BaseComponent (@components/base.component)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the abstract component base (scoped root + logger).
import { BaseComponent } from '@components/base.component';

/**
 * PaginationComponent is a composition unit embedded by list pages so paging
 * behaviour lives in one reusable place instead of being duplicated per page.
 */
// Declare the pagination component, extending BaseComponent.
export class PaginationComponent extends BaseComponent {
  // Locator for the numbered page buttons (relative to the root).
  private readonly pageButtons: Locator;

  // Build the component, scoping its root to the pagination list.
  constructor(page: Page) {
    // Initialise BaseComponent with the pagination <ul> as the root.
    super(page, page.locator('.oxd-pagination__ul'));
    // Page-number buttons only (excludes the prev/next arrows).
    this.pageButtons = this.root.locator('.oxd-pagination-page-item--page');
  }

  /**
   * Purpose: Report whether the pagination control exists on the current page.
   * @returns Promise resolving to true when the control is visible (false on error).
   */
  // Report whether the pagination control is present.
  public async isPresent(): Promise<boolean> {
    // Return the root's visibility, treating lookup errors as "absent".
    return this.root.isVisible().catch(() => false);
  }

  /**
   * Purpose: Count the page-number buttons currently shown.
   * @returns Promise resolving to the number of pages, or 0 when pagination is absent.
   */
  // Count the page-number buttons (0 when pagination is absent).
  public async pageCount(): Promise<number> {
    // Return 0 early when there is no pagination control.
    if (!(await this.isPresent())) return 0;
    // Otherwise count the page buttons.
    return this.pageButtons.count();
  }

  /**
   * Purpose: Navigate to a specific results page by its 1-based number.
   * @param pageNumber - 1-based page index to open; out-of-range values are a no-op.
   * @returns Promise that resolves once the click is issued (or skipped).
   * @example await pagination.goToPage(2);
   */
  // Navigate to a 1-based page number (no-op when out of range).
  public async goToPage(pageNumber: number): Promise<void> {
    // Resolve the button at the zero-based index.
    const button = this.pageButtons.nth(pageNumber - 1);
    // Only click when that page button is actually visible.
    if (await button.isVisible()) {
      // Trace the page change.
      this.log.debug(`Pagination → page ${pageNumber}`);
      // Click the page button.
      await button.click();
    }
  }
}
