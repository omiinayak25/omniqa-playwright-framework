/**
 * --------------------------------------------------------
 * File: inventory.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Page object for the SauceDemo inventory (products) screen. Reads product
 * names/prices, sorts the list, and adds items to the cart. Composes the
 * SauceHeaderComponent (composition over inheritance).
 *
 * Responsibilities:
 * - Confirm the products page has loaded
 * - Report item count, product names, and parsed prices
 * - Add a product to the cart by display name
 * - Sort products via the ProductSort enum
 *
 * Used By:
 * checkout.flow.ts; tests/ui/saucedemo/checkout.spec.ts;
 * tests/e2e/saucedemo-purchase.e2e.spec.ts; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), SauceHeaderComponent
 * (@components/saucedemo/header.component), config (@config/config),
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

/** Sort options exposed by the product sort dropdown. */
export enum ProductSort {
  NAME_ASC = 'az',
  NAME_DESC = 'za',
  PRICE_ASC = 'lohi',
  PRICE_DESC = 'hilo',
}

/**
 * SauceInventoryPage is the products-screen Page Object and the entry point of
 * the purchase flow. It composes SauceHeaderComponent for cart/logout actions
 * rather than inheriting them.
 */
export class SauceInventoryPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = SAUCEDEMO_ROUTES.INVENTORY;

  /** Composed reusable component. */
  public readonly header: SauceHeaderComponent;

  private readonly pageTitle: Locator;
  private readonly items: Locator;
  private readonly itemNames: Locator;
  private readonly itemPrices: Locator;
  private readonly itemDescriptions: Locator;
  private readonly itemImages: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new SauceHeaderComponent(page);
    this.pageTitle = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemDescriptions = page.locator('.inventory_item_desc');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Purpose: Confirm the inventory page rendered by checking the "Products"
   * title (React renders after DOMContentLoaded, so it waits first).
   * @returns Promise resolving to true when the title reads "Products".
   */
  public async isLoaded(): Promise<boolean> {
    // React renders after DOMContentLoaded — wait for the title before reading.
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    if (!(await this.pageTitle.isVisible())) return false;
    return (await this.pageTitle.textContent())?.trim() === 'Products';
  }

  /**
   * Purpose: Count the product cards on the page.
   * @returns Promise resolving to the number of inventory items.
   */
  public async itemCount(): Promise<number> {
    return this.items.count();
  }

  /**
   * Purpose: List all product display names.
   * @returns Promise resolving to an array of product-name strings.
   */
  public async productNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: List product prices parsed as numbers (the leading "$" stripped).
   * @returns Promise resolving to an array of numeric prices.
   */
  public async productPrices(): Promise<number[]> {
    const raw = await this.itemPrices.allInnerTexts();
    return raw.map((p) => Number.parseFloat(p.replace('$', '')));
  }

  /**
   * Purpose: List each product's short description text.
   * @returns Promise resolving to an array of description strings.
   */
  public async productDescriptions(): Promise<string[]> {
    return this.itemDescriptions.allInnerTexts();
  }

  /**
   * Purpose: List the image source (`src`) of every product card, so callers
   * can verify each product actually displays an image.
   * @returns Promise resolving to an array of image src strings ('' if absent).
   */
  public async productImageSources(): Promise<string[]> {
    const count = await this.itemImages.count();
    const sources: string[] = [];
    for (let i = 0; i < count; i += 1) {
      sources.push((await this.itemImages.nth(i).getAttribute('src')) ?? '');
    }
    return sources;
  }

  /**
   * Purpose: Add a single product to the cart by its display name.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise that resolves once the card's "Add to cart" button is clicked.
   * @example await inventory.addToCart('Sauce Labs Backpack');
   */
  public async addToCart(productName: string): Promise<void> {
    this.log.info(`Adding "${productName}" to cart`);
    // Filter the item cards down to the one whose text matches, so the click
    // targets the correct product's button regardless of position.
    const card = this.items.filter({ hasText: productName });
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  /**
   * Purpose: Change the product sort order via the sort dropdown.
   * @param option - ProductSort enum value (name/price, ascending/descending).
   * @returns Promise that resolves once the option is selected.
   * @example await inventory.sortBy(ProductSort.PRICE_ASC);
   */
  public async sortBy(option: ProductSort): Promise<void> {
    await this.selectByValue(this.sortDropdown, option, 'sort dropdown');
  }

  /**
   * Purpose: Read the currently selected sort option value.
   * @returns Promise resolving to the selected ProductSort value (e.g. 'az').
   */
  public async selectedSort(): Promise<string> {
    return this.sortDropdown.inputValue();
  }

  /**
   * Purpose: Remove a product from the cart directly on the inventory card.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise that resolves once the card's "Remove" button is clicked.
   */
  public async removeFromCart(productName: string): Promise<void> {
    this.log.info(`Removing "${productName}" from cart`);
    const card = this.items.filter({ hasText: productName });
    await card.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Purpose: Read a product card's action-button label, so tests can assert the
   * Add-to-cart ↔ Remove toggle.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise resolving to the button label ('Add to cart' or 'Remove').
   */
  public async cartButtonLabel(productName: string): Promise<string> {
    const card = this.items.filter({ hasText: productName });
    return (await card.locator('button').innerText()).trim();
  }

  /**
   * Purpose: Open a product's detail page (PDP) by clicking its name. Does NOT assert.
   * @param productName - Exact product name link to click.
   * @returns Promise that resolves once the product name link is clicked.
   */
  public async openProduct(productName: string): Promise<void> {
    this.log.info(`Opening PDP for "${productName}"`);
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  /**
   * Purpose: List the `alt` text of each product image, for accessibility checks.
   * @returns Promise resolving to an array of alt strings ('' when absent).
   */
  public async productImageAltTexts(): Promise<string[]> {
    const count = await this.itemImages.count();
    const alts: string[] = [];
    for (let i = 0; i < count; i += 1) {
      alts.push((await this.itemImages.nth(i).getAttribute('alt')) ?? '');
    }
    return alts;
  }

  /**
   * Purpose: Read the raw price strings exactly as displayed (e.g. "$29.99"),
   * so tests can assert currency formatting, not just parsed numbers.
   * @returns Promise resolving to the displayed price strings.
   */
  public async productPriceLabels(): Promise<string[]> {
    return this.itemPrices.allInnerTexts();
  }
}
