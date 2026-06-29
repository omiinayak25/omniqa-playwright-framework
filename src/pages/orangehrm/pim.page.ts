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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { DataTableComponent } from '@components/orangehrm/data-table.component';
import { PaginationComponent } from '@components/orangehrm/pagination.component';
import { config } from '@config/config';
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/**
 * OrangePimPage is a Page Object that demonstrates composition: it embeds the
 * reusable DataTable and Pagination components rather than re-implementing grid
 * and paging logic, exposing them publicly for tests to assert on.
 */
export class OrangePimPage extends BasePage {
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  protected readonly path = ORANGEHRM_ROUTES.PIM;

  public readonly table: DataTableComponent;
  public readonly pagination: PaginationComponent;

  private readonly recordsFound: Locator;
  private readonly nameSearch: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new DataTableComponent(page);
    this.pagination = new PaginationComponent(page);
    // OrangeHRM uses singular "Record Found" for exactly one match, plural otherwise.
    this.recordsFound = page.locator('.oxd-text--span', { hasText: /Record(s)? Found/ });
    this.nameSearch = page.locator('input[placeholder="Type for hints..."]').first();
    this.searchButton = page.locator('button[type="submit"]');
  }

  /**
   * Purpose: Wait until the employee data grid has populated.
   * @returns Promise that resolves once the table's first row is visible.
   */
  public async waitForLoaded(): Promise<void> {
    await this.table.waitForLoaded();
  }

  /**
   * Purpose: Parse the "(N) Records Found" banner into a numeric count.
   * @returns Promise resolving to the parsed record count, or 0 if absent.
   */
  public async recordsFoundCount(): Promise<number> {
    const text = (await this.recordsFound.textContent().catch(() => '')) ?? '';
    const match = text.match(/\((\d+)\)/);
    return match ? Number.parseInt(match[1] ?? '0', 10) : 0;
  }

  /**
   * Purpose: Search the employee list by name and wait for results to render.
   * @param name - Employee name (or partial) to search for.
   * @returns Promise that resolves once the filtered grid has loaded.
   * @example await pim.searchByName('Admin');
   */
  public async searchByName(name: string): Promise<void> {
    await this.type(this.nameSearch, name, 'employee name');
    await this.click(this.searchButton, 'search');
    await this.table.waitForLoaded();
  }
}
