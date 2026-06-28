/**
 * --------------------------------------------------------
 * File: header.component.ts
 * Module: UI Components
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Models the persistent SauceDemo top bar (burger menu + shopping-cart link
 * with item-count badge). Reused by every authenticated SauceDemo page via
 * composition.
 *
 * Responsibilities:
 * - Report the cart item count from the badge
 * - Open the cart
 * - Log out via the burger menu
 *
 * Used By:
 * inventory.page.ts (SauceInventoryPage.header) and, through it,
 * checkout.flow.ts / saucedemo specs
 *
 * Dependencies:
 * Playwright (Page, Locator), BaseComponent (@components/base.component)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@components/base.component';

/**
 * SauceHeaderComponent is a composition unit embedded by SauceDemo pages so the
 * shared top-bar interactions (cart, logout) are defined once and reused.
 */
export class SauceHeaderComponent extends BaseComponent {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly burgerButton: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page, page.locator('.header_container'));
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.burgerButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  /**
   * Purpose: Read the cart item count shown on the badge.
   * @returns Promise resolving to the badge number, or 0 when no badge is shown.
   * @example expect(await header.cartCount()).toBe(2);
   */
  public async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = (await this.cartBadge.textContent())?.trim() ?? '0';
    return Number.parseInt(text, 10);
  }

  /**
   * Purpose: Navigate to the cart by clicking the cart link.
   * @returns Promise that resolves once the cart link is clicked.
   */
  public async openCart(): Promise<void> {
    this.log.debug('Opening cart');
    await this.cartLink.click();
  }

  /**
   * Purpose: Log the user out via the burger (side) menu.
   * @returns Promise that resolves once the logout link is clicked.
   */
  public async logout(): Promise<void> {
    this.log.debug('Logging out via burger menu');
    await this.burgerButton.click();
    await this.logoutLink.click();
  }
}
