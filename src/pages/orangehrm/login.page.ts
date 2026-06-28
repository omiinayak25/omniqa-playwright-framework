/**
 * --------------------------------------------------------
 * File: login.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Page object for the OrangeHRM login screen. Provides credential entry,
 * submission, and error-message reading; assertions are left to tests.
 *
 * Responsibilities:
 * - Fill and submit username/password (login / loginAsAdmin)
 * - Read the async-rendered error alert text
 * - Report whether the login form has loaded
 *
 * Used By:
 * tests/setup/orange-auth.setup.ts, orangehrm login specs; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config (@config/config),
 * ORANGEHRM_ROUTES (@constants/ui-routes.constants),
 * UserCredentials (@models/user.model)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * OrangeHRM is an Angular SPA — the form and alert render after
 * DOMContentLoaded, hence the explicit waitFor calls.
 * --------------------------------------------------------
 */
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';
import type { UserCredentials } from '@models/user.model';

/**
 * OrangeLoginPage is a Page Object encapsulating the OrangeHRM sign-in screen,
 * so authentication setup and login tests interact through intention-revealing
 * methods instead of raw locators.
 */
export class OrangeLoginPage extends BasePage {
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  protected readonly path = ORANGEHRM_ROUTES.LOGIN;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorAlert: Locator;
  private readonly requiredFieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.requiredFieldErrors = page.locator('.oxd-input-field-error-message');
  }

  /**
   * Purpose: Fill credentials and submit the login form. Does NOT assert success.
   * @param credentials - Username/password pair to authenticate with.
   * @returns Promise that resolves once the submit button is clicked.
   */
  public async login(credentials: UserCredentials): Promise<void> {
    this.log.info(`Logging in as "${credentials.username}"`);
    await this.type(this.usernameInput, credentials.username, 'username');
    await this.type(this.passwordInput, credentials.password, 'password');
    await this.click(this.submitButton, 'submit');
  }

  /**
   * Purpose: Convenience login using the configured OrangeHRM admin credentials.
   * @returns Promise that resolves once login is submitted.
   */
  public async loginAsAdmin(): Promise<void> {
    await this.login(config.ui.orangeHrm.credentials);
  }

  /**
   * Purpose: Read the login error alert text (e.g. invalid credentials).
   * @returns Promise resolving to the error text, or '' if no alert is shown.
   */
  public async errorMessage(): Promise<string> {
    // SPA renders the alert asynchronously — wait for it (briefly) before reading.
    await this.errorAlert.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    if (!(await this.errorAlert.isVisible())) return '';
    return this.readText(this.errorAlert, 'error alert');
  }

  /**
   * Purpose: Report whether the login form is ready for interaction.
   * @returns Promise resolving to true once the submit button is visible.
   */
  public async isLoaded(): Promise<boolean> {
    // Angular renders the form after DOMContentLoaded — wait for the control.
    await this.submitButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    return this.submitButton.isVisible();
  }

  /**
   * Purpose: Submit the form without filling it, to trigger required-field
   * validation. Does NOT assert.
   * @returns Promise that resolves once the submit button is clicked.
   */
  public async submitEmpty(): Promise<void> {
    await this.click(this.submitButton, 'submit (empty)');
  }

  /**
   * Purpose: Count the inline "Required" field-validation messages, so tests can
   * assert both username and password flag as required.
   * @returns Promise resolving to the number of visible required-field errors.
   */
  public async requiredFieldErrorCount(): Promise<number> {
    await this.requiredFieldErrors
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    return this.requiredFieldErrors.count();
  }
}
