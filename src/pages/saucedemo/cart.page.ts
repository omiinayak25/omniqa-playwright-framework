/**
 * --------------------------------------------------------
 * File: cart.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the SauceDemo shopping-cart screen. Reads cart contents and
 * drives the checkout / continue-shopping actions.
 *
 * Responsibilities:
 * - Report the number of items and their names in the cart
 * - Proceed to checkout or continue shopping
 *
 * Used By:
 * checkout.flow.ts; tests/ui/saucedemo/checkout.spec.ts; page.fixtures.ts
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
// Import the composable header component (cart badge + burger menu).
import { SauceHeaderComponent } from '@components/saucedemo/header.component';
// Import the config singleton for the SauceDemo base URL.
import { config } from '@config/config';
// Import the SauceDemo route paths.
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';

/**
 * SauceCartPage is a Page Object for the cart screen, exposing read-only cart
 * state plus the two navigation actions tests and flows need.
 */
// Declare the cart page object, extending BasePage.
export class SauceCartPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the cart route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.CART;

  /** Composed reusable component (cart badge / burger). */
  // Public header component so tests can read the cart badge / open the menu.
  public readonly header: SauceHeaderComponent;

  // Locator for the page title ("Your Cart").
  private readonly pageTitle: Locator;
  // Locator matching every cart line-item row.
  private readonly cartItems: Locator;
  // Locator for the product-name elements within the cart.
  private readonly itemNames: Locator;
  // Locator for the per-line price cells.
  private readonly priceCells: Locator;
  // Locator for the per-line quantity cells.
  private readonly itemQuantities: Locator;
  // Locator for the Checkout button.
  private readonly checkoutButton: Locator;
  // Locator for the Continue Shopping button.
  private readonly continueShoppingButton: Locator;

  // Build the page object and resolve its locators + header component.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Compose the shared header component bound to the same page.
    this.header = new SauceHeaderComponent(page);
    // Resolve the page title element.
    this.pageTitle = page.locator('.title');
    // Resolve all cart item rows.
    this.cartItems = page.locator('.cart_item');
    // Resolve all product-name elements.
    this.itemNames = page.locator('.inventory_item_name');
    // Resolve the price cells scoped to cart items.
    this.priceCells = page.locator('.cart_item .inventory_item_price');
    // Resolve the quantity cells scoped to cart items.
    this.itemQuantities = page.locator('.cart_item .cart_quantity');
    // Resolve the Checkout button by its data-test hook.
    this.checkoutButton = page.locator('[data-test="checkout"]');
    // Resolve the Continue Shopping button by its data-test hook.
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Purpose: Confirm the cart screen rendered (title reads "Your Cart").
   * @returns Promise resolving to true when the cart title is shown.
   */
  // Report whether the cart screen rendered (title equals "Your Cart").
  public async isLoaded(): Promise<boolean> {
    // Wait briefly for the title; swallow timeouts so the check still resolves.
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Return true only when the trimmed title matches exactly.
    return (await this.pageTitle.textContent())?.trim() === 'Your Cart';
  }

  /**
   * Purpose: Count the line items currently in the cart.
   * @returns Promise resolving to the number of cart items.
   */
  // Count the cart line items.
  public async itemCount(): Promise<number> {
    // Delegate to the cart-item locator's count().
    return this.cartItems.count();
  }

  /**
   * Purpose: List cart line-item prices parsed as numbers (leading "$" stripped).
   * @returns Promise resolving to an array of numeric prices.
   */
  // List the cart prices as numbers (currency symbol stripped).
  public async itemPrices(): Promise<number[]> {
    // Read the raw price texts (e.g. "$29.99").
    const raw = await this.priceCells.allInnerTexts();
    // Strip the "$" and parse each to a float.
    return raw.map((p) => Number.parseFloat(p.replace('$', '')));
  }

  /**
   * Purpose: List the per-line quantities as numbers.
   * @returns Promise resolving to an array of quantities.
   */
  // List the per-line quantities as integers.
  public async itemQuantitiesList(): Promise<number[]> {
    // Read the raw quantity texts.
    const raw = await this.itemQuantities.allInnerTexts();
    // Trim and parse each to an integer.
    return raw.map((q) => Number.parseInt(q.trim(), 10));
  }

  /**
   * Purpose: Open a cart line item's detail page (PDP) by clicking its name.
   * @param productName - Exact product name link to click.
   * @returns Promise that resolves once the product name link is clicked.
   */
  // Open a cart item's product detail page by clicking its name link.
  public async openProduct(productName: string): Promise<void> {
    // Filter the names to the matching product and click the first match.
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  /**
   * Purpose: List the product names currently in the cart.
   * @returns Promise resolving to an array of item-name strings.
   */
  // List the product names currently in the cart.
  public async itemNamesList(): Promise<string[]> {
    // Return the inner text of every name element.
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: Advance from the cart to checkout step one.
   * @returns Promise that resolves once the checkout button is clicked.
   */
  // Proceed from the cart to checkout step one.
  public async proceedToCheckout(): Promise<void> {
    // Click the Checkout button.
    await this.click(this.checkoutButton, 'checkout');
  }

  /**
   * Purpose: Return to the inventory page to keep shopping.
   * @returns Promise that resolves once the continue-shopping button is clicked.
   */
  // Return to the inventory to keep shopping.
  public async continueShopping(): Promise<void> {
    // Click the Continue Shopping button.
    await this.click(this.continueShoppingButton, 'continue shopping');
  }

  /**
   * Purpose: Remove a single product from the cart by its display name.
   * @param productName - Exact product name of the line item to remove.
   * @returns Promise that resolves once that item's Remove button is clicked.
   */
  // Remove one product from the cart by its display name.
  public async removeItem(productName: string): Promise<void> {
    // Trace the removal.
    this.log.info(`Removing "${productName}" from cart`);
    // Narrow to the matching line-item row.
    const item = this.cartItems.filter({ hasText: productName });
    // Click that row's Remove button.
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Purpose: Remove every product from the cart (used to empty it).
   * @returns Promise that resolves once no line items remain.
   */
  // Remove every product from the cart (empty it).
  public async removeAllItems(): Promise<void> {
    // Match all Remove buttons currently present.
    const removeButtons = this.page.getByRole('button', { name: 'Remove' });
    // Each click removes a line item, so re-count until the cart is empty.
    for (let remaining = await removeButtons.count(); remaining > 0; remaining -= 1) {
      // Click the first remaining Remove button each iteration.
      await removeButtons.first().click();
    }
  }
}
