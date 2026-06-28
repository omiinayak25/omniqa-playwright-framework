/**
 * --------------------------------------------------------
 * File: checkout.flow.ts
 * Module: Business Flows
 * Project: OMNIQA Playwright Framework
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
import type { Page } from '@playwright/test';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import { SauceCartPage } from '@pages/saucedemo/cart.page';
import { CheckoutInfoPage } from '@pages/saucedemo/checkout-info.page';
import { CheckoutOverviewPage } from '@pages/saucedemo/checkout-overview.page';
import { CheckoutCompletePage } from '@pages/saucedemo/checkout-complete.page';
import { scopedLogger } from '@utils/logger';
import type { CheckoutInfo } from '@models/user.model';

/**
 * CheckoutFlow is the Business-Flow Facade for SauceDemo checkout. It composes
 * the five checkout page objects and exposes the whole purchase journey as a
 * single reusable action, keeping multi-screen logic out of individual specs.
 */
export class CheckoutFlow {
  private readonly inventory: SauceInventoryPage;
  private readonly cart: SauceCartPage;
  private readonly info: CheckoutInfoPage;
  private readonly overview: CheckoutOverviewPage;
  private readonly complete: CheckoutCompletePage;
  private readonly log = scopedLogger('CheckoutFlow');

  constructor(page: Page) {
    this.inventory = new SauceInventoryPage(page);
    this.cart = new SauceCartPage(page);
    this.info = new CheckoutInfoPage(page);
    this.overview = new CheckoutOverviewPage(page);
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
  public async purchase(products: readonly string[], info: CheckoutInfo): Promise<string> {
    this.log.info(`Purchasing ${products.length} product(s)`);
    await this.inventory.open();
    for (const product of products) {
      await this.inventory.addToCart(product);
    }
    await this.inventory.header.openCart();
    await this.cart.proceedToCheckout();
    await this.info.fillInformation(info);
    await this.info.continue();
    await this.overview.finish();
    return this.complete.confirmationText();
  }

  /**
   * Purpose: Navigate to checkout step one (customer information) with the given
   * products in the cart, starting from a reset state. Stops BEFORE filling the
   * form so tests can drive validation. Assumes an authenticated session.
   * @param products - Display names of the products to add.
   * @returns Promise that resolves once the information page is reached.
   */
  public async goToInformation(products: readonly string[]): Promise<void> {
    await this.inventory.open();
    await this.inventory.header.resetAppState();
    for (const product of products) {
      await this.inventory.addToCart(product);
    }
    await this.inventory.header.openCart();
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
  public async goToOverview(products: readonly string[], info: CheckoutInfo): Promise<void> {
    await this.goToInformation(products);
    await this.info.fillInformation(info);
    await this.info.continue();
  }

  /**
   * Purpose: Expose the order overview totals so tests can assert tax/total
   * arithmetic (assumes the overview page is currently displayed).
   * @returns Promise resolving to an object with subtotal, tax, and total amounts.
   */
  public async openOverviewTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    return {
      subtotal: await this.overview.subtotal(),
      tax: await this.overview.tax(),
      total: await this.overview.total(),
    };
  }
}
