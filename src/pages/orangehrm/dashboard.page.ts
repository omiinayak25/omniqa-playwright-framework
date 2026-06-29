/**
 * --------------------------------------------------------
 * File: dashboard.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the OrangeHRM Dashboard — the landing screen reached after a
 * successful login.
 *
 * Responsibilities:
 * - Confirm the dashboard has loaded (header visible) so tests can assert login
 * - Expose the breadcrumb header text and the logged-in user name
 *
 * Used By:
 * tests/setup/orange-auth.setup.ts, orangehrm UI specs; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config (@config/config),
 * ORANGEHRM_ROUTES (@constants/ui-routes.constants)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the shared BasePage (navigation + logged helpers).
import { BasePage } from '@pages/base.page';
// Import the config singleton for the OrangeHRM base URL.
import { config } from '@config/config';
// Import the OrangeHRM route paths.
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/**
 * OrangeDashboardPage is a Page Object for the post-login landing screen. It
 * exists so tests can verify a successful login and read identity details
 * without touching raw selectors.
 */
// Declare the OrangeHRM dashboard page object, extending BasePage.
export class OrangeDashboardPage extends BasePage {
  // Supply the OrangeHRM base URL required by BasePage.
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  // Supply the dashboard route path required by BasePage.
  protected readonly path = ORANGEHRM_ROUTES.DASHBOARD;

  // Locator for the breadcrumb/module header ("Dashboard").
  private readonly headerTitle: Locator;
  // Locator for the logged-in user's name in the top bar.
  private readonly userDropdown: Locator;
  // Locator for the side-menu module name labels.
  private readonly menuItemNames: Locator;
  // Locator for the side-menu module items (clickable).
  private readonly menuItems: Locator;
  // Locator for the dashboard widget cards.
  private readonly widgets: Locator;
  // Locator for the Quick Launch widget (by its text).
  private readonly quickLaunch: Locator;
  // Locator for the side-menu search input.
  private readonly menuSearch: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the breadcrumb header element.
    this.headerTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
    // Resolve the user-name element.
    this.userDropdown = page.locator('.oxd-userdropdown-name');
    // Resolve the side-menu name labels.
    this.menuItemNames = page.locator('.oxd-main-menu-item--name');
    // Resolve the side-menu items.
    this.menuItems = page.locator('.oxd-main-menu-item');
    // Resolve the dashboard widget cards.
    this.widgets = page.locator('.orangehrm-dashboard-widget');
    // Resolve the Quick Launch widget by its exact text.
    this.quickLaunch = page.getByText('Quick Launch', { exact: true });
    // Resolve the side-menu search input.
    this.menuSearch = page.locator('.oxd-main-menu-search input');
  }

  /**
   * Purpose: Determine whether the dashboard has finished rendering, signalling
   * a successful login. Waits for the breadcrumb header (Angular renders it
   * after DOMContentLoaded) before checking visibility.
   * @returns Promise resolving to true once the header is visible.
   */
  // Report whether the dashboard rendered (header visible) → login succeeded.
  public async isLoaded(): Promise<boolean> {
    // Wait briefly for the header; swallow timeouts so the check still resolves.
    await this.headerTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Return the header's visibility.
    return this.headerTitle.isVisible();
  }

  /**
   * Purpose: Read the breadcrumb/module header text.
   * @returns Promise resolving to the trimmed header text.
   */
  // Read the breadcrumb/module header text.
  public async headerText(): Promise<string> {
    // Return the trimmed header text.
    return this.readText(this.headerTitle, 'header title');
  }

  /**
   * Purpose: Read the name shown in the user dropdown (the logged-in user).
   * @returns Promise resolving to the trimmed user-name text.
   */
  // Read the logged-in user's name from the top bar.
  public async loggedInUser(): Promise<string> {
    // Return the trimmed user-name text.
    return this.readText(this.userDropdown, 'user dropdown');
  }

  /**
   * Purpose: List the side-menu module names visible to the current role —
   * the surface authorization tests assert against.
   * @returns Promise resolving to the trimmed module names (e.g. Admin, PIM).
   */
  // List the side-menu module names visible to the current role.
  public async sideMenuItems(): Promise<string[]> {
    // Wait briefly for the first menu label to appear; swallow timeouts.
    await this.menuItemNames
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => undefined);
    // Read all labels, trim each, and drop empties.
    return (await this.menuItemNames.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  }

  /**
   * Purpose: Report whether a given module is present in the side menu.
   * @param name - Module name to look for (case-sensitive label, e.g. 'Admin').
   * @returns Promise resolving to true when the module is visible to this role.
   */
  // Report whether a named module is present in the side menu.
  public async hasMenuItem(name: string): Promise<boolean> {
    // Check the visible menu list for the name.
    return (await this.sideMenuItems()).includes(name);
  }

  /**
   * Purpose: Open a side-menu module by its visible name. Does NOT assert.
   * @param name - Module name to click (e.g. 'Admin', 'PIM').
   * @returns Promise that resolves once the module is opened.
   */
  // Open a side-menu module by its visible name.
  public async openMenu(name: string): Promise<void> {
    // Click the first menu item whose text matches the name.
    await this.click(this.menuItems.filter({ hasText: name }).first(), `menu: ${name}`);
  }

  /**
   * Purpose: Count the dashboard widgets that have rendered.
   * @returns Promise resolving to the number of dashboard widget cards.
   */
  // Count the rendered dashboard widget cards.
  public async widgetCount(): Promise<number> {
    // Wait briefly for the first widget; swallow timeouts.
    await this.widgets
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => undefined);
    // Return the widget count.
    return this.widgets.count();
  }

  /**
   * Purpose: Report whether the Quick Launch widget is present.
   * @returns Promise resolving to true when the Quick Launch widget is visible.
   */
  // Report whether the Quick Launch widget is present.
  public async hasQuickLaunch(): Promise<boolean> {
    // Return its visibility (false on any lookup error).
    return this.quickLaunch.isVisible().catch(() => false);
  }

  /**
   * Purpose: Filter the side menu by typing into its search box.
   * @param term - Text to type into the menu search.
   * @returns Promise that resolves once the term is entered.
   */
  // Filter the side menu by typing into its search box.
  public async filterMenu(term: string): Promise<void> {
    // Type the search term into the menu search input.
    await this.type(this.menuSearch, term, 'menu search');
  }
}
