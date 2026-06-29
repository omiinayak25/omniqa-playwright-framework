/**
 * --------------------------------------------------------
 * File: data-table.component.ts
 * Module: UI Components
 * Project: OMINQA Playwright Framework
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
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the abstract component base (scoped root + logger).
import { BaseComponent } from '@components/base.component';

/**
 * DataTableComponent is a composition unit: pages embed it to read OrangeHRM
 * grid data without re-declaring `.oxd-table` selectors, keeping table logic in
 * one reusable place.
 */
// Declare the data-table component, extending BaseComponent.
export class DataTableComponent extends BaseComponent {
  // Locator for the data rows (relative to the root).
  private readonly rows: Locator;
  // Locator for the header cells (column labels).
  private readonly headerCells: Locator;
  // Locator for the header "select all" checkbox wrapper.
  private readonly headerCheckbox: Locator;

  // Build the component, scoping its root to the grid table.
  constructor(page: Page) {
    // Initialise BaseComponent with the table as the root.
    super(page, page.locator('.oxd-table'));
    // Resolve the data rows relative to the table root.
    this.rows = this.root.locator('.oxd-table-card');
    // Resolve the header cells relative to the table root.
    this.headerCells = this.root.locator('.oxd-table-header-cell');
    // Click the wrapper label (not the raw input) so OrangeHRM's React onChange fires.
    this.headerCheckbox = this.root.locator('.oxd-table-header .oxd-checkbox-wrapper');
  }

  /**
   * Purpose: Wait until the first data row has actually rendered (i.e. the
   * async data fetch has completed), not just the empty grid container.
   * @param timeoutMs - Max wait per element in milliseconds (default 30000).
   * @returns Promise that resolves once loaded (or quietly after timeout).
   */
  // Wait for the grid (and its first row) to actually render.
  public async waitForLoaded(timeoutMs = 30_000): Promise<void> {
    // Wait for the table container; swallow timeouts.
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
  // Count the rendered data rows.
  public async rowCount(): Promise<number> {
    // Delegate to the rows locator's count().
    return this.rows.count();
  }

  /**
   * Purpose: Read the trimmed text of a specific cell.
   * @param row - Zero-based row index.
   * @param column - Zero-based column index.
   * @returns Promise resolving to the cell's trimmed text ('' if empty).
   * @example const name = await table.cellText(0, 1);
   */
  // Read the trimmed text of a single cell (by row + column index).
  public async cellText(row: number, column: number): Promise<string> {
    // Narrow to the target cell within the target row.
    const cell = this.rows.nth(row).locator('.oxd-table-cell').nth(column);
    // Return its trimmed text (default '' when null).
    return (await cell.textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Collect every value in a column across all visible rows.
   * @param column - Zero-based column index to extract.
   * @returns Promise resolving to an array of trimmed cell texts, top to bottom.
   */
  // Collect every cell value in a given column, top to bottom.
  public async columnValues(column: number): Promise<string[]> {
    // Count the rows to iterate over.
    const count = await this.rowCount();
    // Accumulate the column values here.
    const values: string[] = [];
    // Walk each row by index.
    for (let i = 0; i < count; i++) {
      // Push that row's cell text for the target column.
      values.push(await this.cellText(i, column));
    }
    // Return the collected column values.
    return values;
  }

  /**
   * Purpose: List the visible column header labels (blank cells dropped — e.g.
   * the leading checkbox column).
   * @returns Promise resolving to the non-empty header texts, left to right.
   */
  // List the non-empty column header labels.
  public async columnHeaders(): Promise<string[]> {
    // Read header texts, trim each, and drop empties (e.g. checkbox column).
    return (await this.headerCells.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  }

  /**
   * Purpose: Toggle the selection checkbox of a single data row.
   * @param row - Zero-based row index to select.
   * @returns Promise that resolves once the row checkbox is clicked.
   */
  // Toggle a single row's selection checkbox.
  public async selectRow(row: number): Promise<void> {
    // Click that row's checkbox wrapper (triggers React onChange).
    await this.rows.nth(row).locator('.oxd-checkbox-wrapper').click();
  }

  /**
   * Purpose: Toggle the header "select all" checkbox.
   * @returns Promise that resolves once the header checkbox is clicked.
   */
  // Toggle the header "select all" checkbox.
  public async selectAll(): Promise<void> {
    // Click the header checkbox wrapper.
    await this.headerCheckbox.click();
  }

  /**
   * Purpose: Count the currently selected (checked) row checkboxes.
   * @returns Promise resolving to the number of checked row checkboxes.
   */
  // Count the currently checked row checkboxes.
  public async selectedRowCount(): Promise<number> {
    // The row <input type="checkbox"> carries no class (the styling sits on a
    // sibling <span>), so match by element + native checked state.
    return this.root.locator('.oxd-table-card input[type="checkbox"]:checked').count();
  }
}
