/**
 * --------------------------------------------------------
 * File: checkout-info.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for SauceDemo checkout step one (customer information). Fills the
 * shipping form, continues to the overview, and reads validation errors.
 *
 * Responsibilities:
 * - Fill first name, last name, and postal code
 * - Continue to checkout step two
 * - Read the error banner text for negative tests
 *
 * Used By:
 * checkout.flow.ts; tests/ui/saucedemo/checkout.spec.ts;
 * tests/e2e/saucedemo-purchase.e2e.spec.ts; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config (@config/config),
 * SAUCEDEMO_ROUTES (@constants/ui-routes.constants),
 * CheckoutInfo (@models/user.model)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the shared BasePage (navigation + logged helpers).
import { BasePage } from '@pages/base.page';
// Import the config singleton for the SauceDemo base URL.
import { config } from '@config/config';
// Import the SauceDemo route paths.
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';
// Import the customer-information contract (first/last name + postal code).
import type { CheckoutInfo } from '@models/user.model';

/**
 * CheckoutInfoPage is the step-one Page Object of the SauceDemo checkout flow,
 * encapsulating the customer-information form so flows and tests fill it via a
 * single typed method.
 */
// Declare the checkout step-one (customer info) page object, extending BasePage.
export class CheckoutInfoPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the checkout step-one route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_STEP_ONE;

  // Locator for the first-name input.
  private readonly firstName: Locator;
  // Locator for the last-name input.
  private readonly lastName: Locator;
  // Locator for the postal-code input.
  private readonly postalCode: Locator;
  // Locator for the Continue button (advances to the overview).
  private readonly continueButton: Locator;
  // Locator for the Cancel button (returns to the cart).
  private readonly cancelButton: Locator;
  // Locator for the validation error banner.
  private readonly errorBanner: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the first-name field by id.
    this.firstName = page.locator('#first-name');
    // Resolve the last-name field by id.
    this.lastName = page.locator('#last-name');
    // Resolve the postal-code field by id.
    this.postalCode = page.locator('#postal-code');
    // Resolve the Continue button by id.
    this.continueButton = page.locator('#continue');
    // Resolve the Cancel button by its data-test hook.
    this.cancelButton = page.locator('[data-test="cancel"]');
    // Resolve the error banner by its data-test hook.
    this.errorBanner = page.locator('[data-test="error"]');
  }

  /**
   * Purpose: Fill the customer information form (first/last name, postal code).
   * @param info - CheckoutInfo with firstName, lastName, and postalCode.
   * @returns Promise that resolves once all fields are filled.
   * @example await info.fillInformation({ firstName: 'Jane', lastName: 'Doe', postalCode: '90210' });
   */
  // Fill the three customer-information fields from the given payload.
  public async fillInformation(info: CheckoutInfo): Promise<void> {
    // Type the first name.
    await this.type(this.firstName, info.firstName, 'first name');
    // Type the last name.
    await this.type(this.lastName, info.lastName, 'last name');
    // Type the postal code.
    await this.type(this.postalCode, info.postalCode, 'postal code');
  }

  /**
   * Purpose: Continue from step one to the order overview (step two).
   * @returns Promise that resolves once the continue button is clicked.
   */
  // Advance from step one to the order overview.
  public async continue(): Promise<void> {
    // Click the Continue button.
    await this.click(this.continueButton, 'continue');
  }

  /**
   * Purpose: Cancel checkout step one and return to the shopping cart.
   * @returns Promise that resolves once the cancel button is clicked.
   */
  // Cancel out of step one back to the cart.
  public async cancel(): Promise<void> {
    // Click the Cancel button.
    await this.click(this.cancelButton, 'cancel');
  }

  /**
   * Purpose: Read the validation error banner (e.g. missing required field).
   * @returns Promise resolving to the error text, or '' when no error is shown.
   */
  // Read the validation error banner text (empty when no error).
  public async errorMessage(): Promise<string> {
    // Short-circuit to '' when the banner is not visible.
    if (!(await this.errorBanner.isVisible())) return '';
    // Otherwise return the trimmed banner text.
    return this.readText(this.errorBanner, 'error banner');
  }
}
