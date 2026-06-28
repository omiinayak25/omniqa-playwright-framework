/**
 * --------------------------------------------------------
 * File: data-table.component.ts
 * Module: UI Components
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Reusable wrapper over OrangeHRM's `oxd` data grid. Works on ANY OrangeHRM
 * list page (PIM, Admin users, etc.) and is composed into pages, not inherited.
 *
 * Responsibilities:
 * - Wait for grid rows to actually render after the async data fetch
 * - Expose row counts and individual cell / column values for assertions
 *
 * Used By:
 * pim.page.ts (OrangePimPage.table); any future OrangeHRM list page
 *
 * Dependencies:
 * Playwright (Page, Locator), BaseComponent (@components/base.component)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * The `.oxd-table` container appears before its data resolves — waitForLoaded
 * also waits for the first row so callers never read an empty shell.
 * --------------------------------------------------------
 */
import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@components/base.component';

/**
 * DataTableComponent is a composition unit: pages embed it to read OrangeHRM
 * grid data without re-declaring `.oxd-table` selectors, keeping table logic in
 * one reusable place.
 */
export class DataTableComponent extends BaseComponent {
  private readonly rows: Locator;

  constructor(page: Page) {
    super(page, page.locator('.oxd-table'));
    this.rows = this.root.locator('.oxd-table-card');
  }

  /**
   * Purpose: Wait until the first data row has actually rendered (i.e. the
   * async data fetch has completed), not just the empty grid container.
   * @param timeoutMs - Max wait per element in milliseconds (default 30000).
   * @returns Promise that resolves once loaded (or quietly after timeout).
   */
  public async waitForLoaded(timeoutMs = 30_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
    // The grid container appears before the async data fetch resolves — wait
    // for the first row so callers see populated data, not an empty shell.
    await this.rows
      .first()
      .waitFor({ state: 'visible', timeout: timeoutMs })
      .catch(() => undefined);
  }

  /**
   * Purpose: Count the currently rendered data rows.
   * @returns Promise resolving to the number of visible `.oxd-table-card` rows.
   */
  public async rowCount(): Promise<number> {
    return this.rows.count();
  }

  /**
   * Purpose: Read the trimmed text of a specific cell.
   * @param row - Zero-based row index.
   * @param column - Zero-based column index.
   * @returns Promise resolving to the cell's trimmed text ('' if empty).
   * @example const name = await table.cellText(0, 1);
   */
  public async cellText(row: number, column: number): Promise<string> {
    const cell = this.rows.nth(row).locator('.oxd-table-cell').nth(column);
    return (await cell.textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Collect every value in a column across all visible rows.
   * @param column - Zero-based column index to extract.
   * @returns Promise resolving to an array of trimmed cell texts, top to bottom.
   */
  public async columnValues(column: number): Promise<string[]> {
    const count = await this.rowCount();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      values.push(await this.cellText(i, column));
    }
    return values;
  }
}
