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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';

/**
 * CheckoutOverviewPage is the step-two Page Object of the SauceDemo checkout
 * flow; it exposes parsed monetary totals so tests can assert tax/total
 * arithmetic before the order is finished.
 */
export class CheckoutOverviewPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.CHECKOUT_STEP_TWO;

  private readonly itemNames: Locator;
  private readonly priceCells: Locator;
  private readonly quantityCells: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly summaryValues: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.locator('.inventory_item_name');
    this.priceCells = page.locator('.cart_item .inventory_item_price');
    this.quantityCells = page.locator('.cart_item .cart_quantity');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.summaryValues = page.locator('.summary_value_label');
    this.finishButton = page.locator('#finish');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  /**
   * Purpose: List the product names included in the order.
   * @returns Promise resolving to an array of item-name strings.
   */
  public async itemNamesList(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: List the order line-item prices parsed as numbers.
   * @returns Promise resolving to an array of numeric prices.
   */
  public async itemPrices(): Promise<number[]> {
    const raw = await this.priceCells.allInnerTexts();
    return raw.map((p) => Number.parseFloat(p.replace('$', '')));
  }

  /**
   * Purpose: List the per-line quantities as numbers.
   * @returns Promise resolving to an array of quantities.
   */
  public async itemQuantitiesList(): Promise<number[]> {
    const raw = await this.quantityCells.allInnerTexts();
    return raw.map((q) => Number.parseInt(q.trim(), 10));
  }

  /**
   * Purpose: Read the payment-information value shown on the overview.
   * @returns Promise resolving to the payment info text ('' when absent).
   */
  public async paymentInformation(): Promise<string> {
    return (await this.summaryValues.first().textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Read the shipping-information value shown on the overview.
   * @returns Promise resolving to the shipping info text ('' when absent).
   */
  public async shippingInformation(): Promise<string> {
    return (await this.summaryValues.nth(1).textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Cancel the order from the overview and return to the inventory.
   * @returns Promise that resolves once the cancel button is clicked.
   */
  public async cancel(): Promise<void> {
    await this.click(this.cancelButton, 'cancel');
  }

  /**
   * Purpose: Extract the first numeric amount from a summary label's text.
   * @param locator - Label locator whose text contains a "$NN.NN" value.
   * @returns Promise resolving to the parsed number, or 0 when none is found.
   */
  private async amountFrom(locator: Locator): Promise<number> {
    const text = (await locator.textContent()) ?? '';
    const match = text.match(/[\d.]+/);
    return match ? Number.parseFloat(match[0]) : 0;
  }

  /**
   * Purpose: Read the order subtotal (item total before tax).
   * @returns Promise resolving to the subtotal amount.
   */
  public subtotal(): Promise<number> {
    return this.amountFrom(this.subtotalLabel);
  }

  /**
   * Purpose: Read the tax amount applied to the order.
   * @returns Promise resolving to the tax amount.
   */
  public tax(): Promise<number> {
    return this.amountFrom(this.taxLabel);
  }

  /**
   * Purpose: Read the grand total (subtotal + tax).
   * @returns Promise resolving to the total amount.
   */
  public total(): Promise<number> {
    return this.amountFrom(this.totalLabel);
  }

  /**
   * Purpose: Confirm and finish the order, advancing to the completion page.
   * @returns Promise that resolves once the finish button is clicked.
   */
  public async finish(): Promise<void> {
    await this.click(this.finishButton, 'finish');
  }
}
