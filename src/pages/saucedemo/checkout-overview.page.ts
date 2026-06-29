/**
 * --------------------------------------------------------
 * File: checkout-overview.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for SauceDemo checkout step two (order overview & totals). Reads
 * the item list and parses subtotal/tax/total amounts, then finishes the order.
 *
 * Responsibilities:
 * - List the products in the order
 * - Parse subtotal, tax, and total numeric amounts from their labels
 * - Finish (confirm) the order
 *
 * Used By:
 * checkout.flow.ts (totals + finish); tests/ui/saucedemo/checkout.spec.ts;
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
 * CheckoutOverviewPage is the step-two Page Object of the SauceDemo checkout
 * flow; it exposes parsed monetary totals so tests can assert tax/total
 * arithmetic before the order is finished.
 */
// Declare the checkout step-two (order overview) page object, extending BasePage.
export class CheckoutOverviewPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the checkout step-two route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_STEP_TWO;

  // Locator for the product-name elements in the order summary.
  private readonly itemNames: Locator;
  // Locator for the per-line price cells.
  private readonly priceCells: Locator;
  // Locator for the per-line quantity cells.
  private readonly quantityCells: Locator;
  // Locator for the "Item total" (subtotal) summary label.
  private readonly subtotalLabel: Locator;
  // Locator for the "Tax" summary label.
  private readonly taxLabel: Locator;
  // Locator for the "Total" summary label.
  private readonly totalLabel: Locator;
  // Locator for the payment/shipping value labels.
  private readonly summaryValues: Locator;
  // Locator for the Finish button (completes the order).
  private readonly finishButton: Locator;
  // Locator for the Cancel button (returns to the inventory).
  private readonly cancelButton: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the product-name elements.
    this.itemNames = page.locator('.inventory_item_name');
    // Resolve the price cells scoped to cart items.
    this.priceCells = page.locator('.cart_item .inventory_item_price');
    // Resolve the quantity cells scoped to cart items.
    this.quantityCells = page.locator('.cart_item .cart_quantity');
    // Resolve the subtotal label.
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    // Resolve the tax label.
    this.taxLabel = page.locator('.summary_tax_label');
    // Resolve the total label.
    this.totalLabel = page.locator('.summary_total_label');
    // Resolve the payment/shipping value labels.
    this.summaryValues = page.locator('.summary_value_label');
    // Resolve the Finish button by id.
    this.finishButton = page.locator('#finish');
    // Resolve the Cancel button by its data-test hook.
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  /**
   * Purpose: List the product names included in the order.
   * @returns Promise resolving to an array of item-name strings.
   */
  // List the product names included in the order.
  public async itemNamesList(): Promise<string[]> {
    // Return the inner text of every name element.
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: List the order line-item prices parsed as numbers.
   * @returns Promise resolving to an array of numeric prices.
   */
  // List the order prices as numbers (currency symbol stripped).
  public async itemPrices(): Promise<number[]> {
    // Read the raw price texts.
    const raw = await this.priceCells.allInnerTexts();
    // Strip "$" and parse each to a float.
    return raw.map((p) => Number.parseFloat(p.replace('$', '')));
  }

  /**
   * Purpose: List the per-line quantities as numbers.
   * @returns Promise resolving to an array of quantities.
   */
  // List the per-line quantities as integers.
  public async itemQuantitiesList(): Promise<number[]> {
    // Read the raw quantity texts.
    const raw = await this.quantityCells.allInnerTexts();
    // Trim and parse each to an integer.
    return raw.map((q) => Number.parseInt(q.trim(), 10));
  }

  /**
   * Purpose: Read the payment-information value shown on the overview.
   * @returns Promise resolving to the payment info text ('' when absent).
   */
  // Read the payment-information value (first summary value label).
  public async paymentInformation(): Promise<string> {
    // Return the trimmed text of the first value label, or '' when absent.
    return (await this.summaryValues.first().textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Read the shipping-information value shown on the overview.
   * @returns Promise resolving to the shipping info text ('' when absent).
   */
  // Read the shipping-information value (second summary value label).
  public async shippingInformation(): Promise<string> {
    // Return the trimmed text of the second value label, or '' when absent.
    return (await this.summaryValues.nth(1).textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Cancel the order from the overview and return to the inventory.
   * @returns Promise that resolves once the cancel button is clicked.
   */
  // Cancel the order from the overview (returns to inventory).
  public async cancel(): Promise<void> {
    // Click the Cancel button.
    await this.click(this.cancelButton, 'cancel');
  }

  /**
   * Purpose: Extract the first numeric amount from a summary label's text.
   * @param locator - Label locator whose text contains a "$NN.NN" value.
   * @returns Promise resolving to the parsed number, or 0 when none is found.
   */
  // Helper: extract the first "$NN.NN" number from a summary label.
  private async amountFrom(locator: Locator): Promise<number> {
    // Read the label's text (default '' when null).
    const text = (await locator.textContent()) ?? '';
    // Match the first run of digits/decimal point.
    const match = text.match(/[\d.]+/);
    // Parse the match to a float, or return 0 when nothing matched.
    return match ? Number.parseFloat(match[0]) : 0;
  }

  /**
   * Purpose: Read the order subtotal (item total before tax).
   * @returns Promise resolving to the subtotal amount.
   */
  // Read the subtotal (item total before tax).
  public subtotal(): Promise<number> {
    // Parse the amount from the subtotal label.
    return this.amountFrom(this.subtotalLabel);
  }

  /**
   * Purpose: Read the tax amount applied to the order.
   * @returns Promise resolving to the tax amount.
   */
  // Read the tax amount applied to the order.
  public tax(): Promise<number> {
    // Parse the amount from the tax label.
    return this.amountFrom(this.taxLabel);
  }

  /**
   * Purpose: Read the grand total (subtotal + tax).
   * @returns Promise resolving to the total amount.
   */
  // Read the grand total (subtotal + tax).
  public total(): Promise<number> {
    // Parse the amount from the total label.
    return this.amountFrom(this.totalLabel);
  }

  /**
   * Purpose: Confirm and finish the order, advancing to the completion page.
   * @returns Promise that resolves once the finish button is clicked.
   */
  // Finish (confirm) the order, advancing to the completion page.
  public async finish(): Promise<void> {
    // Click the Finish button.
    await this.click(this.finishButton, 'finish');
  }
}
