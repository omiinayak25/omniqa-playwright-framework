/**
 * --------------------------------------------------------
 * File: checkout.flow.ts
 * Module: Business Flows
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Orchestrates the full SauceDemo purchase journey across five page objects
 * behind one intention-revealing method (`purchase`). Acts as a Facade over the
 * POM layer; contains NO assertions (tests call the flow, then assert).
 *
 * Responsibilities:
 * - Drive inventory -> cart -> info -> overview -> complete in sequence
 * - Return the order confirmation text for tests to assert on
 * - Expose overview totals (subtotal/tax/total) for arithmetic assertions
 *
 * Used By:
 * tests/ui/saucedemo/checkout.spec.ts;
 * tests/e2e/saucedemo-purchase.e2e.spec.ts
 *
 * Dependencies:
 * Playwright (Page); SauceInventoryPage, SauceCartPage, CheckoutInfoPage,
 * CheckoutOverviewPage, CheckoutCompletePage (@pages/saucedemo/*);
 * scopedLogger (@utils/logger); CheckoutInfo (@models/user.model)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Why a separate layer? Page objects model a single screen; multi-screen
 * journeys repeated across many tests belong in a reusable flow, not copied
 * step-by-step into each spec.
 * --------------------------------------------------------
 */
// Import Playwright's page type (type-only).
import type { Page } from '@playwright/test';
// Import the inventory page object (entry point of the journey).
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
// Import the cart page object.
import { SauceCartPage } from '@pages/saucedemo/cart.page';
// Import the checkout step-one (info) page object.
import { CheckoutInfoPage } from '@pages/saucedemo/checkout-info.page';
// Import the checkout step-two (overview) page object.
import { CheckoutOverviewPage } from '@pages/saucedemo/checkout-overview.page';
// Import the checkout completion page object.
import { CheckoutCompletePage } from '@pages/saucedemo/checkout-complete.page';
// Import the name-scoped logger factory.
import { scopedLogger } from '@utils/logger';
// Import the customer-information contract (type-only).
import type { CheckoutInfo } from '@models/user.model';

/**
 * CheckoutFlow is the Business-Flow Facade for SauceDemo checkout. It composes
 * the five checkout page objects and exposes the whole purchase journey as a
 * single reusable action, keeping multi-screen logic out of individual specs.
 */
// Declare the checkout business-flow facade.
export class CheckoutFlow {
  // Inventory page object (add products).
  private readonly inventory: SauceInventoryPage;
  // Cart page object (proceed to checkout).
  private readonly cart: SauceCartPage;
  // Checkout step-one page object (customer info).
  private readonly info: CheckoutInfoPage;
  // Checkout step-two page object (overview/totals).
  private readonly overview: CheckoutOverviewPage;
  // Checkout completion page object (confirmation).
  private readonly complete: CheckoutCompletePage;
  // Flow-scoped logger.
  private readonly log = scopedLogger('CheckoutFlow');

  // Build the flow by composing all five checkout page objects on one page.
  constructor(page: Page) {
    // Instantiate the inventory page object.
    this.inventory = new SauceInventoryPage(page);
    // Instantiate the cart page object.
    this.cart = new SauceCartPage(page);
    // Instantiate the step-one (info) page object.
    this.info = new CheckoutInfoPage(page);
    // Instantiate the step-two (overview) page object.
    this.overview = new CheckoutOverviewPage(page);
    // Instantiate the completion page object.
    this.complete = new CheckoutCompletePage(page);
  }

  /**
   * Purpose: Purchase the given products end-to-end, walking every checkout
   * screen in order (assumes an already-authenticated session).
   * @param products - Display names of the products to add and buy.
   * @param info - Customer information (name + postal code) for step one.
   * @returns Promise resolving to the confirmation header text for the test to assert on.
   * @example const msg = await flow.purchase(['Sauce Labs Backpack'], info);
   */
  // Walk the whole purchase journey and return the confirmation text.
  public async purchase(products: readonly string[], info: CheckoutInfo): Promise<string> {
    // Trace how many products are being purchased.
    this.log.info(`Purchasing ${products.length} product(s)`);
    // Open the inventory.
    await this.inventory.open();
    // Add each requested product to the cart.
    for (const product of products) {
      // Add the current product.
      await this.inventory.addToCart(product);
    }
    // Open the cart via the header.
    await this.inventory.header.openCart();
    // Proceed from the cart to checkout step one.
    await this.cart.proceedToCheckout();
    // Fill the customer information.
    await this.info.fillInformation(info);
    // Continue to the overview.
    await this.info.continue();
    // Finish the order.
    await this.overview.finish();
    // Return the confirmation header text for the test to assert on.
    return this.complete.confirmationText();
  }

  /**
   * Purpose: Navigate to checkout step one (customer information) with the given
   * products in the cart, starting from a reset state. Stops BEFORE filling the
   * form so tests can drive validation. Assumes an authenticated session.
   * @param products - Display names of the products to add.
   * @returns Promise that resolves once the information page is reached.
   */
  // Navigate to checkout step one with products in the cart (no form fill).
  public async goToInformation(products: readonly string[]): Promise<void> {
    // Open the inventory.
    await this.inventory.open();
    // A fresh context (stored auth) starts with an empty cart, so no reset is
    // needed — and it avoids the flaky burger-menu interaction on WebKit/Firefox.
    await this.inventory.isLoaded();
    // Add each requested product.
    for (const product of products) {
      // Add the current product.
      await this.inventory.addToCart(product);
    }
    // Open the cart via the header.
    await this.inventory.header.openCart();
    // Proceed to checkout step one.
    await this.cart.proceedToCheckout();
  }

  /**
   * Purpose: Navigate all the way to the order overview (step two) with the given
   * products and customer info, WITHOUT finishing the order. Lets tests assert on
   * totals, item lines, and payment/shipping info.
   * @param products - Display names of the products to add.
   * @param info - Customer information for step one.
   * @returns Promise that resolves once the overview is displayed.
   */
  // Navigate all the way to the order overview (without finishing).
  public async goToOverview(products: readonly string[], info: CheckoutInfo): Promise<void> {
    // First reach step one with the products in the cart.
    await this.goToInformation(products);
    // Fill the customer information.
    await this.info.fillInformation(info);
    // Continue to the overview.
    await this.info.continue();
  }

  /**
   * Purpose: Expose the order overview totals so tests can assert tax/total
   * arithmetic (assumes the overview page is currently displayed).
   * @returns Promise resolving to an object with subtotal, tax, and total amounts.
   */
  // Expose the overview totals as one object (subtotal/tax/total).
  public async openOverviewTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    // Read all three amounts from the overview page.
    return {
      // Read the subtotal.
      subtotal: await this.overview.subtotal(),
      // Read the tax.
      tax: await this.overview.tax(),
      // Read the total.
      total: await this.overview.total(),
    };
  }
}
