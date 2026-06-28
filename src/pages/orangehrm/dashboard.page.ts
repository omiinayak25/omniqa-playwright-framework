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

  constructor(page: Page) {
    super(page);
    this.headerTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.userDropdown = page.locator('.oxd-userdropdown-name');
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
}
