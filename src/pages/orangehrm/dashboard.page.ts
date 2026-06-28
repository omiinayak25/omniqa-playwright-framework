/**
 * --------------------------------------------------------
 * File: dashboard.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/**
 * OrangeDashboardPage is a Page Object for the post-login landing screen. It
 * exists so tests can verify a successful login and read identity details
 * without touching raw selectors.
 */
export class OrangeDashboardPage extends BasePage {
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  protected readonly path = ORANGEHRM_ROUTES.DASHBOARD;

  private readonly headerTitle: Locator;
  private readonly userDropdown: Locator;
  private readonly menuItemNames: Locator;
  private readonly menuItems: Locator;
  private readonly widgets: Locator;
  private readonly quickLaunch: Locator;
  private readonly menuSearch: Locator;

  constructor(page: Page) {
    super(page);
    this.headerTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.userDropdown = page.locator('.oxd-userdropdown-name');
    this.menuItemNames = page.locator('.oxd-main-menu-item--name');
    this.menuItems = page.locator('.oxd-main-menu-item');
    this.widgets = page.locator('.orangehrm-dashboard-widget');
    this.quickLaunch = page.getByText('Quick Launch', { exact: true });
    this.menuSearch = page.locator('.oxd-main-menu-search input');
  }

  /**
   * Purpose: Determine whether the dashboard has finished rendering, signalling
   * a successful login. Waits for the breadcrumb header (Angular renders it
   * after DOMContentLoaded) before checking visibility.
   * @returns Promise resolving to true once the header is visible.
   */
  public async isLoaded(): Promise<boolean> {
    await this.headerTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    return this.headerTitle.isVisible();
  }

  /**
   * Purpose: Read the breadcrumb/module header text.
   * @returns Promise resolving to the trimmed header text.
   */
  public async headerText(): Promise<string> {
    return this.readText(this.headerTitle, 'header title');
  }

  /**
   * Purpose: Read the name shown in the user dropdown (the logged-in user).
   * @returns Promise resolving to the trimmed user-name text.
   */
  public async loggedInUser(): Promise<string> {
    return this.readText(this.userDropdown, 'user dropdown');
  }

  /**
   * Purpose: List the side-menu module names visible to the current role —
   * the surface authorization tests assert against.
   * @returns Promise resolving to the trimmed module names (e.g. Admin, PIM).
   */
  public async sideMenuItems(): Promise<string[]> {
    await this.menuItemNames
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => undefined);
    return (await this.menuItemNames.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  }

  /**
   * Purpose: Report whether a given module is present in the side menu.
   * @param name - Module name to look for (case-sensitive label, e.g. 'Admin').
   * @returns Promise resolving to true when the module is visible to this role.
   */
  public async hasMenuItem(name: string): Promise<boolean> {
    return (await this.sideMenuItems()).includes(name);
  }

  /**
   * Purpose: Open a side-menu module by its visible name. Does NOT assert.
   * @param name - Module name to click (e.g. 'Admin', 'PIM').
   * @returns Promise that resolves once the module is opened.
   */
  public async openMenu(name: string): Promise<void> {
    await this.click(this.menuItems.filter({ hasText: name }).first(), `menu: ${name}`);
  }

  /**
   * Purpose: Count the dashboard widgets that have rendered.
   * @returns Promise resolving to the number of dashboard widget cards.
   */
  public async widgetCount(): Promise<number> {
    await this.widgets
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => undefined);
    return this.widgets.count();
  }

  /**
   * Purpose: Report whether the Quick Launch widget is present.
   * @returns Promise resolving to true when the Quick Launch widget is visible.
   */
  public async hasQuickLaunch(): Promise<boolean> {
    return this.quickLaunch.isVisible().catch(() => false);
  }

  /**
   * Purpose: Filter the side menu by typing into its search box.
   * @param term - Text to type into the menu search.
   * @returns Promise that resolves once the term is entered.
   */
  public async filterMenu(term: string): Promise<void> {
    await this.type(this.menuSearch, term, 'menu search');
  }
}
