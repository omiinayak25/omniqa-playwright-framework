/**
 * --------------------------------------------------------
 * File: product-details.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the SauceDemo Product Detail Page (PDP) — the single-product
 * screen reached by clicking a product name on the inventory. Reads the
 * product's name/price/description/image and adds/removes it from the cart.
 *
 * Responsibilities:
 * - Confirm the PDP rendered and read its product fields
 * - Add / remove the product and read the action-button label
 * - Navigate back to the products list
 *
 * Used By:
 * tests/ui/saucedemo/product-details.spec.ts; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), SauceHeaderComponent, config,
 * SAUCEDEMO_ROUTES
 *
 * Last Updated: 2026-06-28
 * Notes:
 * The PDP is normally reached by clicking a product from the inventory; `open()`
 * (baseUrl + /inventory-item.html) exists only to satisfy BasePage and is not
 * the primary entry point.
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

/**
 * SauceProductDetailsPage models the single-product (PDP) screen, composing the
 * shared header so cart-badge assertions work the same as on the inventory.
 */
// Declare the product-detail page object, extending BasePage.
export class SauceProductDetailsPage extends BasePage {
  // Supply the SauceDemo base URL required by BasePage.
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  // Supply the PDP route path (mainly to satisfy BasePage; reached via clicks).
  protected readonly path = '/inventory-item.html';

  /** Composed reusable component (cart badge / burger). */
  // Public header component so tests can read the cart badge.
  public readonly header: SauceHeaderComponent;

  // Locator for the product name heading.
  private readonly name: Locator;
  // Locator for the product price.
  private readonly price: Locator;
  // Locator for the product description.
  private readonly description: Locator;
  // Locator for the product image.
  private readonly image: Locator;
  // Locator for the "Back to products" link.
  private readonly backButton: Locator;
  // Locator for the add/remove action button.
  private readonly actionButton: Locator;

  // Build the page object and resolve its locators + header component.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Compose the shared header component bound to the same page.
    this.header = new SauceHeaderComponent(page);
    // Resolve the product-name element.
    this.name = page.locator('.inventory_details_name');
    // Resolve the product-price element.
    this.price = page.locator('.inventory_details_price');
    // Resolve the product-description element.
    this.description = page.locator('.inventory_details_desc');
    // Resolve the product-image element.
    this.image = page.locator('.inventory_details_img');
    // Resolve the back-to-products link by its data-test hook.
    this.backButton = page.locator('[data-test="back-to-products"]');
    // Resolve the add/remove button within the details container.
    this.actionButton = page.locator('.inventory_details_desc_container button');
  }

  /**
   * Purpose: Confirm the PDP rendered by waiting for the product name.
   * @returns Promise resolving to true once the product name is visible.
   */
  // Report whether the PDP rendered (product name visible).
  public async isLoaded(): Promise<boolean> {
    // Wait briefly for the name; swallow timeouts so the check still resolves.
    await this.name.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Return the name's visibility.
    return this.name.isVisible();
  }

  /** @returns Promise resolving to the product display name. */
  // Read the product display name.
  public async productName(): Promise<string> {
    // Return the trimmed name text.
    return this.readText(this.name, 'pdp name');
  }

  /** @returns Promise resolving to the numeric price (leading "$" stripped). */
  // Read the product price as a number.
  public async productPrice(): Promise<number> {
    // Read the raw price text (e.g. "$29.99").
    const raw = await this.readText(this.price, 'pdp price');
    // Strip "$" and parse to a float.
    return Number.parseFloat(raw.replace('$', ''));
  }

  /** @returns Promise resolving to the product description text. */
  // Read the product description.
  public async productDescription(): Promise<string> {
    // Return the trimmed description text.
    return this.readText(this.description, 'pdp description');
  }

  /** @returns Promise resolving to the product image `src` ('' when absent). */
  // Read the product image src.
  public async imageSource(): Promise<string> {
    // Return the image src, defaulting to '' when absent.
    return (await this.image.getAttribute('src')) ?? '';
  }

  /** @returns Promise resolving to the action button label (Add to cart / Remove). */
  // Read the add/remove button's current label.
  public async actionButtonLabel(): Promise<string> {
    // Return the trimmed button text.
    return this.readText(this.actionButton, 'pdp action button');
  }

  /**
   * Purpose: Add this product to the cart from the PDP. Does NOT assert.
   * @returns Promise that resolves once the add button is clicked.
   */
  // Add this product to the cart from the PDP.
  public async addToCart(): Promise<void> {
    // Click the action button (acts as "Add to cart" when not yet added).
    await this.click(this.actionButton, 'pdp add to cart');
  }

  /**
   * Purpose: Navigate back to the products (inventory) list. Does NOT assert.
   * @returns Promise that resolves once the back link is clicked.
   */
  // Navigate back to the products (inventory) list.
  public async backToProducts(): Promise<void> {
    // Click the back link.
    await this.click(this.backButton, 'back to products');
  }
}
