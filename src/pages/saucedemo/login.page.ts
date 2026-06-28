/**
 * --------------------------------------------------------
 * File: login.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Page object for the SauceDemo login screen. Actions only — tests assert on
 * `errorMessage()` or the resulting navigation.
 *
 * Responsibilities:
 * - Fill and submit credentials (login / loginAsStandardUser)
 * - Read the error banner text
 * - Report whether the login button is ready
 *
 * Used By:
 * tests/setup/auth.setup.ts, saucedemo login specs; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config (@config/config),
 * SAUCEDEMO_ROUTES (@constants/ui-routes.constants),
 * UserCredentials (@models/user.model)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';
import type { UserCredentials } from '@models/user.model';

/**
 * SauceLoginPage is the SauceDemo sign-in Page Object, used by auth setup and
 * login tests to authenticate through intention-revealing methods rather than
 * raw locators (no assertions live here).
 */
export class SauceLoginPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.LOGIN;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorBanner = page.locator('[data-test="error"]');
  }

  /**
   * Purpose: Fill credentials and submit. Does NOT assert success/failure.
   * @param credentials - Username/password pair to authenticate with.
   * @returns Promise that resolves once the login button is clicked.
   */
  public async login(credentials: UserCredentials): Promise<void> {
    this.log.info(`Logging in as "${credentials.username}"`);
    await this.type(this.usernameInput, credentials.username, 'username');
    await this.type(this.passwordInput, credentials.password, 'password');
    await this.click(this.loginButton, 'login button');
  }

  /**
   * Purpose: Convenience login using the configured SauceDemo standard user.
   * @returns Promise that resolves once login is submitted.
   */
  public async loginAsStandardUser(): Promise<void> {
    await this.login(config.ui.sauceDemo.credentials);
  }

  /**
   * Purpose: Read the login error banner text. Tests assert on this.
   * @returns Promise resolving to the error text, or '' when no error is shown.
   */
  public async errorMessage(): Promise<string> {
    if (!(await this.errorBanner.isVisible())) return '';
    return this.readText(this.errorBanner, 'error banner');
  }

  /**
   * Purpose: Report whether the login form is ready for interaction.
   * @returns Promise resolving to true when the login button is visible.
   */
  public async isLoaded(): Promise<boolean> {
    return this.loginButton.isVisible();
  }
}
