/**
 * --------------------------------------------------------
 * File: login.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
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
// Import Playwright's page and element-handle types (type-only, erased at build).
import type { Page, Locator } from '@playwright/test';
// Import the abstract base class that supplies navigation + logged helpers.
import { BasePage } from '@pages/base.page';
// Import the immutable config singleton (base URLs + credentials).
import { config } from '@config/config';
// Import the SauceDemo route-path constants.
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';
// Import the username/password contract used by the login methods.
import type { UserCredentials } from '@models/user.model';

/**
 * SauceLoginPage is the SauceDemo sign-in Page Object, used by auth setup and
 * login tests to authenticate through intention-revealing methods rather than
 * raw locators (no assertions live here).
 */
// Declare the SauceDemo login page object, extending the shared BasePage.
export class SauceLoginPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the login route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.LOGIN;

  // Locator for the username input field.
  private readonly usernameInput: Locator;
  // Locator for the password input field.
  private readonly passwordInput: Locator;
  // Locator for the submit (Login) button.
  private readonly loginButton: Locator;
  // Locator for the error banner shown on a failed login.
  private readonly errorBanner: Locator;
  // Locator for the error banner's clear (x) button.
  private readonly errorDismiss: Locator;

  // Build the page object and resolve its locators against the injected page.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the username field by its id.
    this.usernameInput = page.locator('#user-name');
    // Resolve the password field by its id.
    this.passwordInput = page.locator('#password');
    // Resolve the login button by its id.
    this.loginButton = page.locator('#login-button');
    // Resolve the error banner by its data-test hook.
    this.errorBanner = page.locator('[data-test="error"]');
    // Resolve the error dismiss button (sibling of the banner, or any .error-button).
    this.errorDismiss = page.locator('[data-test="error"] ~ button.error-button, .error-button');
  }

  /**
   * Purpose: Fill credentials and submit. Does NOT assert success/failure.
   * @param credentials - Username/password pair to authenticate with.
   * @returns Promise that resolves once the login button is clicked.
   */
  // Fill the username/password and submit the form.
  public async login(credentials: UserCredentials): Promise<void> {
    // Trace which user is being signed in.
    this.log.info(`Logging in as "${credentials.username}"`);
    // Type the username into its field.
    await this.type(this.usernameInput, credentials.username, 'username');
    // Type the password into its field.
    await this.type(this.passwordInput, credentials.password, 'password');
    // Click the login button to submit.
    await this.click(this.loginButton, 'login button');
  }

  /**
   * Purpose: Convenience login using the configured SauceDemo standard user.
   * @returns Promise that resolves once login is submitted.
   */
  // Sign in with the configured default standard_user credentials.
  public async loginAsStandardUser(): Promise<void> {
    // Delegate to login() with the credentials from config.
    await this.login(config.ui.sauceDemo.credentials);
  }

  /**
   * Purpose: Read the login error banner text. Tests assert on this.
   * @returns Promise resolving to the error text, or '' when no error is shown.
   */
  // Read the error banner text (empty string when no error is present).
  public async errorMessage(): Promise<string> {
    // Short-circuit to '' when the banner is not visible.
    if (!(await this.errorBanner.isVisible())) return '';
    // Otherwise return the trimmed banner text.
    return this.readText(this.errorBanner, 'error banner');
  }

  /**
   * Purpose: Report whether the login form is ready for interaction.
   * @returns Promise resolving to true when the login button is visible.
   */
  // Report whether the login form has rendered (login button visible).
  public async isLoaded(): Promise<boolean> {
    // Visibility of the submit button is the readiness signal.
    return this.loginButton.isVisible();
  }

  /**
   * Purpose: Sign in using ONLY the keyboard (Tab + Enter) — proves the form is
   * operable without a pointer for accessibility coverage. Does NOT assert.
   * @param credentials - Username/password pair to authenticate with.
   * @returns Promise that resolves once Enter submits the form.
   */
  // Sign in using only the keyboard, to prove pointer-free operability.
  public async loginWithKeyboard(credentials: UserCredentials): Promise<void> {
    // Trace the keyboard-only login.
    this.log.info(`Keyboard login as "${credentials.username}"`);
    // Move focus into the username field.
    await this.usernameInput.focus();
    // Type the username at the keyboard level.
    await this.page.keyboard.type(credentials.username);
    // Tab from username to the password field.
    await this.page.keyboard.press('Tab');
    // Type the password at the keyboard level.
    await this.page.keyboard.type(credentials.password);
    // Press Enter to submit the form.
    await this.page.keyboard.press('Enter');
  }

  /**
   * Purpose: Expose the password field's `type` attribute so tests can assert
   * the value is masked (type="password"), never plain text.
   * @returns Promise resolving to the input type (e.g. 'password').
   */
  // Expose the password field's `type` attribute (security/masking assertion).
  public async passwordInputType(): Promise<string | null> {
    // Read the input's type attribute (expected 'password').
    return this.passwordInput.getAttribute('type');
  }

  /**
   * Purpose: Report whether the error banner is currently visible.
   * @returns Promise resolving to true when an error is shown.
   */
  // Report whether the error banner is currently visible.
  public async isErrorVisible(): Promise<boolean> {
    // Delegate to the banner's visibility.
    return this.errorBanner.isVisible();
  }

  /**
   * Purpose: Dismiss the login error banner via its clear (x) button.
   * @returns Promise that resolves once the dismiss control is clicked.
   */
  // Dismiss the error banner via its clear (x) button, if present.
  public async dismissError(): Promise<void> {
    // Only click when the dismiss control is actually visible.
    if (await this.errorDismiss.first().isVisible()) {
      // Click the first matching dismiss button to clear the banner.
      await this.click(this.errorDismiss.first(), 'error dismiss');
    }
  }
}
