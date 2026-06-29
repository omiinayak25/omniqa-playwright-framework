/**
 * --------------------------------------------------------
 * File: checkout-complete.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the SauceDemo checkout completion (order confirmation)
 * screen. Reads the confirmation header and returns to products.
 *
 * Responsibilities:
 * - Wait for and return the order confirmation header text
 * - Navigate back to the products page
 *
 * Used By:
 * checkout.flow.ts (returns confirmationText); tests/ui/saucedemo/checkout.spec.ts;
 * tests/e2e/saucedemo-purchase.e2e.spec.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config (@config/config),
 * SAUCEDEMO_ROUTES (@constants/ui-routes.constants)
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

/**
 * CheckoutCompletePage is the final-step Page Object in the SauceDemo checkout
 * journey; it exposes the confirmation message so tests/flows can verify a
 * successful purchase.
 */
// Declare the order-confirmation page object, extending BasePage.
export class CheckoutCompletePage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the checkout-complete route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_COMPLETE;

  // Locator for the confirmation header ("Thank you for your order!").
  private readonly header: Locator;
  // Locator for the "Back Home" button.
  private readonly backHomeButton: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the confirmation header element.
    this.header = page.locator('.complete-header');
    // Resolve the back-to-products button by id.
    this.backHomeButton = page.locator('#back-to-products');
  }

  /**
   * Purpose: Read the order confirmation header (e.g. "Thank you for your
   * order!"). Waits for the header first since it renders after navigation.
   * @returns Promise resolving to the trimmed confirmation text.
   * @example expect(await complete.confirmationText()).toContain('Thank you');
   */
  // Read the confirmation header text (after the post-order navigation).
  public async confirmationText(): Promise<string> {
    // Wait briefly for the header to appear; swallow timeouts so the read still runs.
    await this.header.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    // Return the trimmed header text.
    return this.readText(this.header, 'confirmation header');
  }

  /**
   * Purpose: Return to the products/inventory page after an order.
   * @returns Promise that resolves once the back-home button is clicked.
   */
  // Navigate back to the products list via the "Back Home" button.
  public async backToProducts(): Promise<void> {
    // Click the back-home button.
    await this.click(this.backHomeButton, 'back to products');
  }
}
