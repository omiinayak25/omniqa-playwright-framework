/**
 * --------------------------------------------------------
 * File: inventory.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
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

/** Sort options exposed by the product sort dropdown. */
// Enumerate the four sort options, mapping to the dropdown's option values.
export enum ProductSort {
  // Name A→Z maps to the "az" option value.
  NAME_ASC = 'az',
  // Name Z→A maps to the "za" option value.
  NAME_DESC = 'za',
  // Price low→high maps to the "lohi" option value.
  PRICE_ASC = 'lohi',
  // Price high→low maps to the "hilo" option value.
  PRICE_DESC = 'hilo',
}

/**
 * SauceInventoryPage is the products-screen Page Object and the entry point of
 * the purchase flow. It composes SauceHeaderComponent for cart/logout actions
 * rather than inheriting them.
 */
// Declare the inventory page object, extending BasePage.
export class SauceInventoryPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the inventory route path required by BasePage.
  protected readonly path = SAUCEDEMO_ROUTES.INVENTORY;

  /** Composed reusable component. */
  // Public header component so tests can read the badge / open the menu.
  public readonly header: SauceHeaderComponent;

  // Locator for the page title ("Products").
  private readonly pageTitle: Locator;
  // Locator matching every product card.
  private readonly items: Locator;
  // Locator for the product-name elements.
  private readonly itemNames: Locator;
  // Locator for the product price elements.
  private readonly itemPrices: Locator;
  // Locator for the product description elements.
  private readonly itemDescriptions: Locator;
  // Locator for the product card images.
  private readonly itemImages: Locator;
  // Locator for the sort dropdown control.
  private readonly sortDropdown: Locator;

  // Build the page object and resolve its locators + header component.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Compose the shared header component bound to the same page.
    this.header = new SauceHeaderComponent(page);
    // Resolve the page title element.
    this.pageTitle = page.locator('.title');
    // Resolve all product cards.
    this.items = page.locator('.inventory_item');
    // Resolve all product-name elements.
    this.itemNames = page.locator('.inventory_item_name');
    // Resolve all product price elements.
    this.itemPrices = page.locator('.inventory_item_price');
    // Resolve all product description elements.
    this.itemDescriptions = page.locator('.inventory_item_desc');
    // Resolve the <img> inside each product image container.
    this.itemImages = page.locator('.inventory_item_img img');
    // Resolve the sort dropdown by its data-test hook.
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Purpose: Confirm the inventory page rendered by checking the "Products"
   * title (React renders after DOMContentLoaded, so it waits first).
   * @returns Promise resolving to true when the title reads "Products".
   */
  // Report whether the inventory rendered (title equals "Products").
  public async isLoaded(): Promise<boolean> {
    // React renders after DOMContentLoaded — wait for the title before reading.
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Bail out early when the title never became visible.
    if (!(await this.pageTitle.isVisible())) return false;
    // Confirm the trimmed title text matches exactly.
    return (await this.pageTitle.textContent())?.trim() === 'Products';
  }

  /**
   * Purpose: Count the product cards on the page.
   * @returns Promise resolving to the number of inventory items.
   */
  // Count the product cards.
  public async itemCount(): Promise<number> {
    // Delegate to the item locator's count().
    return this.items.count();
  }

  /**
   * Purpose: List all product display names.
   * @returns Promise resolving to an array of product-name strings.
   */
  // List all product display names.
  public async productNames(): Promise<string[]> {
    // Return the inner text of every name element.
    return this.itemNames.allInnerTexts();
  }

  /**
   * Purpose: List product prices parsed as numbers (the leading "$" stripped).
   * @returns Promise resolving to an array of numeric prices.
   */
  // List product prices as numbers (currency symbol stripped).
  public async productPrices(): Promise<number[]> {
    // Read the raw price texts.
    const raw = await this.itemPrices.allInnerTexts();
    // Strip "$" and parse each to a float.
    return raw.map((p) => Number.parseFloat(p.replace('$', '')));
  }

  /**
   * Purpose: List each product's short description text.
   * @returns Promise resolving to an array of description strings.
   */
  // List each product's short description.
  public async productDescriptions(): Promise<string[]> {
    // Return the inner text of every description element.
    return this.itemDescriptions.allInnerTexts();
  }

  /**
   * Purpose: List the image source (`src`) of every product card, so callers
   * can verify each product actually displays an image.
   * @returns Promise resolving to an array of image src strings ('' if absent).
   */
  // List the image src of every product card.
  public async productImageSources(): Promise<string[]> {
    // Count the images to iterate over.
    const count = await this.itemImages.count();
    // Accumulate the src values here.
    const sources: string[] = [];
    // Walk each image by index.
    for (let i = 0; i < count; i += 1) {
      // Push the src (default '' when missing).
      sources.push((await this.itemImages.nth(i).getAttribute('src')) ?? '');
    }
    // Return the collected sources.
    return sources;
  }

  /**
   * Purpose: Add a single product to the cart by its display name.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise that resolves once the card's "Add to cart" button is clicked.
   * @example await inventory.addToCart('Sauce Labs Backpack');
   */
  // Add a product to the cart by its display name.
  public async addToCart(productName: string): Promise<void> {
    // Trace the add.
    this.log.info(`Adding "${productName}" to cart`);
    // Filter the item cards down to the one whose text matches, so the click
    // targets the correct product's button regardless of position.
    const card = this.items.filter({ hasText: productName });
    // Click that card's "Add to cart" button.
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  /**
   * Purpose: Change the product sort order via the sort dropdown.
   * @param option - ProductSort enum value (name/price, ascending/descending).
   * @returns Promise that resolves once the option is selected.
   * @example await inventory.sortBy(ProductSort.PRICE_ASC);
   */
  // Change the sort order via the dropdown.
  public async sortBy(option: ProductSort): Promise<void> {
    // Select the dropdown option whose value matches the enum.
    await this.selectByValue(this.sortDropdown, option, 'sort dropdown');
  }

  /**
   * Purpose: Read the currently selected sort option value.
   * @returns Promise resolving to the selected ProductSort value (e.g. 'az').
   */
  // Read the currently selected sort option value.
  public async selectedSort(): Promise<string> {
    // Return the dropdown's current value.
    return this.sortDropdown.inputValue();
  }

  /**
   * Purpose: Remove a product from the cart directly on the inventory card.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise that resolves once the card's "Remove" button is clicked.
   */
  // Remove a product from the cart directly on its inventory card.
  public async removeFromCart(productName: string): Promise<void> {
    // Trace the removal.
    this.log.info(`Removing "${productName}" from cart`);
    // Narrow to the matching product card.
    const card = this.items.filter({ hasText: productName });
    // Click that card's "Remove" button.
    await card.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Purpose: Read a product card's action-button label, so tests can assert the
   * Add-to-cart ↔ Remove toggle.
   * @param productName - Exact product name to locate the matching card.
   * @returns Promise resolving to the button label ('Add to cart' or 'Remove').
   */
  // Read a product card's action-button label (Add to cart / Remove).
  public async cartButtonLabel(productName: string): Promise<string> {
    // Narrow to the matching product card.
    const card = this.items.filter({ hasText: productName });
    // Return that card's button text, trimmed.
    return (await card.locator('button').innerText()).trim();
  }

  /**
   * Purpose: Open a product's detail page (PDP) by clicking its name. Does NOT assert.
   * @param productName - Exact product name link to click.
   * @returns Promise that resolves once the product name link is clicked.
   */
  // Open a product's detail page by clicking its name link.
  public async openProduct(productName: string): Promise<void> {
    // Trace the navigation to the PDP.
    this.log.info(`Opening PDP for "${productName}"`);
    // Filter the names to the matching product and click the first match.
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  /**
   * Purpose: List the `alt` text of each product image, for accessibility checks.
   * @returns Promise resolving to an array of alt strings ('' when absent).
   */
  // List the alt text of each product image (accessibility checks).
  public async productImageAltTexts(): Promise<string[]> {
    // Count the images to iterate over.
    const count = await this.itemImages.count();
    // Accumulate the alt values here.
    const alts: string[] = [];
    // Walk each image by index.
    for (let i = 0; i < count; i += 1) {
      // Push the alt (default '' when missing).
      alts.push((await this.itemImages.nth(i).getAttribute('alt')) ?? '');
    }
    // Return the collected alt strings.
    return alts;
  }

  /**
   * Purpose: Read the raw price strings exactly as displayed (e.g. "$29.99"),
   * so tests can assert currency formatting, not just parsed numbers.
   * @returns Promise resolving to the displayed price strings.
   */
  // Read the raw displayed price strings (for currency-format assertions).
  public async productPriceLabels(): Promise<string[]> {
    // Return the inner text of every price element verbatim.
    return this.itemPrices.allInnerTexts();
  }
}
