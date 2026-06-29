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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';

/**
 * CheckoutCompletePage is the final-step Page Object in the SauceDemo checkout
 * journey; it exposes the confirmation message so tests/flows can verify a
 * successful purchase.
 */
export class CheckoutCompletePage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_COMPLETE;

  private readonly header: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('.complete-header');
    this.backHomeButton = page.locator('#back-to-products');
  }

  /**
   * Purpose: Read the order confirmation header (e.g. "Thank you for your
   * order!"). Waits for the header first since it renders after navigation.
   * @returns Promise resolving to the trimmed confirmation text.
   * @example expect(await complete.confirmationText()).toContain('Thank you');
   */
  public async confirmationText(): Promise<string> {
    await this.header.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    return this.readText(this.header, 'confirmation header');
  }

  /**
   * Purpose: Return to the products/inventory page after an order.
   * @returns Promise that resolves once the back-home button is clicked.
   */
  public async backToProducts(): Promise<void> {
    await this.click(this.backHomeButton, 'back to products');
  }
}
