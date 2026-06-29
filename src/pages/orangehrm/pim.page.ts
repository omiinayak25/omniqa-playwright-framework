/**
 * --------------------------------------------------------
 * File: pim.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the OrangeHRM PIM (Employee List) screen. Composes the
 * reusable DataTable and Pagination components and adds a name search.
 *
 * Responsibilities:
 * - Wait for the employee grid to load
 * - Parse the "(N) Records Found" banner into a number
 * - Search employees by name (re-waits for the grid afterwards)
 * - Expose `table` and `pagination` components for tests to read
 *
 * Used By:
 * orangehrm PIM/data-table UI specs; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), DataTableComponent +
 * PaginationComponent (@components/orangehrm/*), config (@config/config),
 * ORANGEHRM_ROUTES (@constants/ui-routes.constants)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the shared BasePage (navigation + logged helpers).
import { BasePage } from '@pages/base.page';
// Import the reusable data-grid component.
import { DataTableComponent } from '@components/orangehrm/data-table.component';
// Import the reusable pagination component.
import { PaginationComponent } from '@components/orangehrm/pagination.component';
// Import the config singleton for the OrangeHRM base URL.
import { config } from '@config/config';
// Import the OrangeHRM route paths.
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/**
 * OrangePimPage is a Page Object that demonstrates composition: it embeds the
 * reusable DataTable and Pagination components rather than re-implementing grid
 * and paging logic, exposing them publicly for tests to assert on.
 */
// Declare the OrangeHRM PIM (employee list) page object, extending BasePage.
export class OrangePimPage extends BasePage {
  // Supply the OrangeHRM base URL required by BasePage.
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  // Supply the PIM route path required by BasePage.
  protected readonly path = ORANGEHRM_ROUTES.PIM;

  // Public composed data-table component (grid rows/cells/selection).
  public readonly table: DataTableComponent;
  // Public composed pagination component.
  public readonly pagination: PaginationComponent;

  // Locator for the "(N) Records Found" banner.
  private readonly recordsFound: Locator;
  // Locator for the employee name search input.
  private readonly nameSearch: Locator;
  // Locator for the Search submit button.
  private readonly searchButton: Locator;

  // Build the page object, composing the table + pagination components.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Compose the data-table component bound to the same page.
    this.table = new DataTableComponent(page);
    // Compose the pagination component bound to the same page.
    this.pagination = new PaginationComponent(page);
    // OrangeHRM uses singular "Record Found" for exactly one match, plural otherwise.
    this.recordsFound = page.locator('.oxd-text--span', { hasText: /Record(s)? Found/ });
    // Resolve the name search input (first matching autocomplete field).
    this.nameSearch = page.locator('input[placeholder="Type for hints..."]').first();
    // Resolve the Search submit button.
    this.searchButton = page.locator('button[type="submit"]');
  }

  /**
   * Purpose: Wait until the employee data grid has populated.
   * @returns Promise that resolves once the table's first row is visible.
   */
  // Wait until the employee grid has populated.
  public async waitForLoaded(): Promise<void> {
    // Delegate to the table component's load wait.
    await this.table.waitForLoaded();
  }

  /**
   * Purpose: Parse the "(N) Records Found" banner into a numeric count.
   * @returns Promise resolving to the parsed record count, or 0 if absent.
   */
  // Parse the "(N) Records Found" banner into a number.
  public async recordsFoundCount(): Promise<number> {
    // Read the banner text (default '' on any read error).
    const text = (await this.recordsFound.textContent().catch(() => '')) ?? '';
    // Capture the number inside the parentheses.
    const match = text.match(/\((\d+)\)/);
    // Parse it to an int, or return 0 when no match.
    return match ? Number.parseInt(match[1] ?? '0', 10) : 0;
  }

  /**
   * Purpose: Search the employee list by name and wait for results to render.
   * @param name - Employee name (or partial) to search for.
   * @returns Promise that resolves once the filtered grid has loaded.
   * @example await pim.searchByName('Admin');
   */
  // Search the employee list by name, then wait for the filtered grid.
  public async searchByName(name: string): Promise<void> {
    // Type the name into the search field.
    await this.type(this.nameSearch, name, 'employee name');
    // Click the Search button.
    await this.click(this.searchButton, 'search');
    // Wait for the grid to re-populate with results.
    await this.table.waitForLoaded();
  }
}
