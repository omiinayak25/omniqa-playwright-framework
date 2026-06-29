/**
 * --------------------------------------------------------
 * File: login.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
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
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the shared BasePage (navigation + logged helpers).
import { BasePage } from '@pages/base.page';
// Import the config singleton for the OrangeHRM base URL + credentials.
import { config } from '@config/config';
// Import the OrangeHRM route paths.
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';
// Import the username/password contract used by the login methods.
import type { UserCredentials } from '@models/user.model';

/**
 * OrangeLoginPage is a Page Object encapsulating the OrangeHRM sign-in screen,
 * so authentication setup and login tests interact through intention-revealing
 * methods instead of raw locators.
 */
// Declare the OrangeHRM login page object, extending BasePage.
export class OrangeLoginPage extends BasePage {
  // Supply the OrangeHRM base URL required by BasePage.
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  // Supply the login route path required by BasePage.
  protected readonly path = ORANGEHRM_ROUTES.LOGIN;

  // Locator for the username input (by name attribute).
  private readonly usernameInput: Locator;
  // Locator for the password input (by name attribute).
  private readonly passwordInput: Locator;
  // Locator for the submit button.
  private readonly submitButton: Locator;
  // Locator for the async error alert (invalid credentials).
  private readonly errorAlert: Locator;
  // Locator for inline required-field validation messages.
  private readonly requiredFieldErrors: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the username field by its name attribute.
    this.usernameInput = page.locator('input[name="username"]');
    // Resolve the password field by its name attribute.
    this.passwordInput = page.locator('input[name="password"]');
    // Resolve the submit button by type.
    this.submitButton = page.locator('button[type="submit"]');
    // Resolve the alert text element.
    this.errorAlert = page.locator('.oxd-alert-content-text');
    // Resolve the inline required-field error messages.
    this.requiredFieldErrors = page.locator('.oxd-input-field-error-message');
  }

  /**
   * Purpose: Fill credentials and submit the login form. Does NOT assert success.
   * @param credentials - Username/password pair to authenticate with.
   * @returns Promise that resolves once the submit button is clicked.
   */
  // Fill the credentials and submit the login form.
  public async login(credentials: UserCredentials): Promise<void> {
    // Trace which user is being signed in.
    this.log.info(`Logging in as "${credentials.username}"`);
    // Type the username.
    await this.type(this.usernameInput, credentials.username, 'username');
    // Type the password.
    await this.type(this.passwordInput, credentials.password, 'password');
    // Submit the form.
    await this.click(this.submitButton, 'submit');
  }

  /**
   * Purpose: Convenience login using the configured OrangeHRM admin credentials.
   * @returns Promise that resolves once login is submitted.
   */
  // Sign in with the configured Admin credentials.
  public async loginAsAdmin(): Promise<void> {
    // Delegate to login() with the credentials from config.
    await this.login(config.ui.orangeHrm.credentials);
  }

  /**
   * Purpose: Read the login error alert text (e.g. invalid credentials).
   * @returns Promise resolving to the error text, or '' if no alert is shown.
   */
  // Read the error alert text (empty when no alert is shown).
  public async errorMessage(): Promise<string> {
    // SPA renders the alert asynchronously — wait for it (briefly) before reading.
    await this.errorAlert.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    // Short-circuit to '' when no alert appeared.
    if (!(await this.errorAlert.isVisible())) return '';
    // Otherwise return the trimmed alert text.
    return this.readText(this.errorAlert, 'error alert');
  }

  /**
   * Purpose: Report whether the login form is ready for interaction.
   * @returns Promise resolving to true once the submit button is visible.
   */
  // Report whether the login form has rendered (submit button visible).
  public async isLoaded(): Promise<boolean> {
    // Angular renders the form after DOMContentLoaded — wait for the control.
    await this.submitButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Return the submit button's visibility.
    return this.submitButton.isVisible();
  }

  /**
   * Purpose: Submit the form without filling it, to trigger required-field
   * validation. Does NOT assert.
   * @returns Promise that resolves once the submit button is clicked.
   */
  // Submit the empty form to trigger required-field validation.
  public async submitEmpty(): Promise<void> {
    // Click submit without filling any fields.
    await this.click(this.submitButton, 'submit (empty)');
  }

  /**
   * Purpose: Count the inline "Required" field-validation messages, so tests can
   * assert both username and password flag as required.
   * @returns Promise resolving to the number of visible required-field errors.
   */
  // Count the inline required-field error messages.
  public async requiredFieldErrorCount(): Promise<number> {
    // Wait briefly for the first error to appear; swallow timeouts.
    await this.requiredFieldErrors
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    // Return the count of error messages.
    return this.requiredFieldErrors.count();
  }
}
