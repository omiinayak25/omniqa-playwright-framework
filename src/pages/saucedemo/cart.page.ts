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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { SauceHeaderComponent } from '@components/saucedemo/header.component';
import { config } from '@config/config';
import { SAUCEDEMO_ROUTES } from '@constants/ui-routes.constants';

/**
 * SauceCartPage is a Page Object for the cart screen, exposing read-only cart
 * state plus the two navigation actions tests and flows need.
 */
export class SauceCartPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.CART;

  /** Composed reusable component (cart badge / burger). */
  public readonly header: SauceHeaderComponent;

  private readonly pageTitle: Locator;
  private readonly cartItems: Locator;
  private readonly itemNames: Locator;
  private readonly priceCells: Locator;
  private readonly itemQuantities: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new SauceHeaderComponent(page);
    this.pageTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.priceCells = page.locator('.cart_item .inventory_item_price');
    this.itemQuantities = page.locator('.cart_item .cart_quantity');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Purpose: Confirm the cart screen rendered (title reads "Your Cart").
   * @returns Promise resolving to true when the cart title is shown.
   */
  public async isLoaded(): Promise<boolean> {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    return (await this.pageTitle.textContent())?.trim() === 'Your Cart';
  }

  /**
   * Purpose: Count the line items currently in the cart.
   * @returns Promise resolving to the number of cart items.
   */
  public async itemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /**
   * Purpose: List cart line-item prices parsed as numbers (leading "$" stripped).
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
    const raw = await this.itemQuantities.allInnerTexts();
    return raw.map((q) => Number.parseInt(q.trim(), 10));
  }

  /**
   * Purpose: Open a cart line item's detail page (PDP) by clicking its name.
   * @param productName - Exact product name link to click.
   * @returns Promise that resolves once the product name link is clicked.
   */
  public async openProduct(productName: string): Promise<void> {
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  /**
   * Purpose: List the product names currently in the cart.
   * @returns Promise resolving to an array of item-name strings.
   */
  public async itemNamesList(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: Advance from the cart to checkout step one.
   * @returns Promise that resolves once the checkout button is clicked.
   */
  public async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton, 'checkout');
  }

  /**
   * Purpose: Return to the inventory page to keep shopping.
   * @returns Promise that resolves once the continue-shopping button is clicked.
   */
  public async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton, 'continue shopping');
  }

  /**
   * Purpose: Remove a single product from the cart by its display name.
   * @param productName - Exact product name of the line item to remove.
   * @returns Promise that resolves once that item's Remove button is clicked.
   */
  public async removeItem(productName: string): Promise<void> {
    this.log.info(`Removing "${productName}" from cart`);
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Purpose: Remove every product from the cart (used to empty it).
   * @returns Promise that resolves once no line items remain.
   */
  public async removeAllItems(): Promise<void> {
    const removeButtons = this.page.getByRole('button', { name: 'Remove' });
    // Each click removes a line item, so re-count until the cart is empty.
    for (let remaining = await removeButtons.count(); remaining > 0; remaining -= 1) {
      await removeButtons.first().click();
    }
  }
}
