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
import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@components/base.component';

/**
 * PaginationComponent is a composition unit embedded by list pages so paging
 * behaviour lives in one reusable place instead of being duplicated per page.
 */
export class PaginationComponent extends BaseComponent {
  private readonly pageButtons: Locator;

  constructor(page: Page) {
    super(page, page.locator('.oxd-pagination__ul'));
    // Page-number buttons only (excludes the prev/next arrows).
    this.pageButtons = this.root.locator('.oxd-pagination-page-item--page');
  }

  /**
   * Purpose: Report whether the pagination control exists on the current page.
   * @returns Promise resolving to true when the control is visible (false on error).
   */
  public async isPresent(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  /**
   * Purpose: Count the page-number buttons currently shown.
   * @returns Promise resolving to the number of pages, or 0 when pagination is absent.
   */
  public async pageCount(): Promise<number> {
    if (!(await this.isPresent())) return 0;
    return this.pageButtons.count();
  }

  /**
   * Purpose: Navigate to a specific results page by its 1-based number.
   * @param pageNumber - 1-based page index to open; out-of-range values are a no-op.
   * @returns Promise that resolves once the click is issued (or skipped).
   * @example await pagination.goToPage(2);
   */
  public async goToPage(pageNumber: number): Promise<void> {
    const button = this.pageButtons.nth(pageNumber - 1);
    if (await button.isVisible()) {
      this.log.debug(`Pagination → page ${pageNumber}`);
      await button.click();
    }
  }
}
