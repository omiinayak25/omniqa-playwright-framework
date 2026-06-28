/**
 * --------------------------------------------------------
 * File: product-details.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { SauceHeaderComponent } from '@components/saucedemo/header.component';
import { config } from '@config/config';

/**
 * SauceProductDetailsPage models the single-product (PDP) screen, composing the
 * shared header so cart-badge assertions work the same as on the inventory.
 */
export class SauceProductDetailsPage extends BasePage {
  protected readonly baseUrl = config.ui.sauceDemo.baseUrl;
  protected readonly path = '/inventory-item.html';

  /** Composed reusable component (cart badge / burger). */
  public readonly header: SauceHeaderComponent;

  private readonly name: Locator;
  private readonly price: Locator;
  private readonly description: Locator;
  private readonly image: Locator;
  private readonly backButton: Locator;
  private readonly actionButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new SauceHeaderComponent(page);
    this.name = page.locator('.inventory_details_name');
    this.price = page.locator('.inventory_details_price');
    this.description = page.locator('.inventory_details_desc');
    this.image = page.locator('.inventory_details_img');
    this.backButton = page.locator('[data-test="back-to-products"]');
    this.actionButton = page.locator('.inventory_details_desc_container button');
  }

  /**
   * Purpose: Confirm the PDP rendered by waiting for the product name.
   * @returns Promise resolving to true once the product name is visible.
   */
  public async isLoaded(): Promise<boolean> {
    await this.name.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    return this.name.isVisible();
  }

  /** @returns Promise resolving to the product display name. */
  public async productName(): Promise<string> {
    return this.readText(this.name, 'pdp name');
  }

  /** @returns Promise resolving to the numeric price (leading "$" stripped). */
  public async productPrice(): Promise<number> {
    const raw = await this.readText(this.price, 'pdp price');
    return Number.parseFloat(raw.replace('$', ''));
  }

  /** @returns Promise resolving to the product description text. */
  public async productDescription(): Promise<string> {
    return this.readText(this.description, 'pdp description');
  }

  /** @returns Promise resolving to the product image `src` ('' when absent). */
  public async imageSource(): Promise<string> {
    return (await this.image.getAttribute('src')) ?? '';
  }

  /** @returns Promise resolving to the action button label (Add to cart / Remove). */
  public async actionButtonLabel(): Promise<string> {
    return this.readText(this.actionButton, 'pdp action button');
  }

  /**
   * Purpose: Add this product to the cart from the PDP. Does NOT assert.
   * @returns Promise that resolves once the add button is clicked.
   */
  public async addToCart(): Promise<void> {
    await this.click(this.actionButton, 'pdp add to cart');
  }

  /**
   * Purpose: Navigate back to the products (inventory) list. Does NOT assert.
   * @returns Promise that resolves once the back link is clicked.
   */
  public async backToProducts(): Promise<void> {
    await this.click(this.backButton, 'back to products');
  }
}
