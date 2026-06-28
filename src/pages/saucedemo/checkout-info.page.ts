/**
 * --------------------------------------------------------
 * File: checkout-info.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';
import type { CheckoutInfo } from '@models/user.model';

/**
 * CheckoutInfoPage is the step-one Page Object of the SauceDemo checkout flow,
 * encapsulating the customer-information form so flows and tests fill it via a
 * single typed method.
 */
export class CheckoutInfoPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_STEP_ONE;

  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly postalCode: Locator;
  private readonly continueButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('#first-name');
    this.lastName = page.locator('#last-name');
    this.postalCode = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.errorBanner = page.locator('[data-test="error"]');
  }

  /**
   * Purpose: Fill the customer information form (first/last name, postal code).
   * @param info - CheckoutInfo with firstName, lastName, and postalCode.
   * @returns Promise that resolves once all fields are filled.
   * @example await info.fillInformation({ firstName: 'Jane', lastName: 'Doe', postalCode: '90210' });
   */
  public async fillInformation(info: CheckoutInfo): Promise<void> {
    await this.type(this.firstName, info.firstName, 'first name');
    await this.type(this.lastName, info.lastName, 'last name');
    await this.type(this.postalCode, info.postalCode, 'postal code');
  }

  /**
   * Purpose: Continue from step one to the order overview (step two).
   * @returns Promise that resolves once the continue button is clicked.
   */
  public async continue(): Promise<void> {
    await this.click(this.continueButton, 'continue');
  }

  /**
   * Purpose: Read the validation error banner (e.g. missing required field).
   * @returns Promise resolving to the error text, or '' when no error is shown.
   */
  public async errorMessage(): Promise<string> {
    if (!(await this.errorBanner.isVisible())) return '';
    return this.readText(this.errorBanner, 'error banner');
  }
}
