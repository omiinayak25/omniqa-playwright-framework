/**
 * --------------------------------------------------------
 * File: header.component.ts
 * Module: UI Components
 * Project: OMINQA Playwright Framework
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
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the abstract component base (scoped root + logger).
import { BaseComponent } from '@components/base.component';

/**
 * SauceHeaderComponent is a composition unit embedded by SauceDemo pages so the
 * shared top-bar interactions (cart, logout) are defined once and reused.
 */
// Declare the SauceDemo header component, extending BaseComponent.
export class SauceHeaderComponent extends BaseComponent {
  // Locator for the shopping-cart link.
  private readonly cartLink: Locator;
  // Locator for the cart item-count badge.
  private readonly cartBadge: Locator;
  // Locator for the burger (open menu) button.
  private readonly burgerButton: Locator;
  // Locator for the burger close (x) button.
  private readonly closeButton: Locator;
  // Locator for the Logout side-menu link.
  private readonly logoutLink: Locator;
  // Locator for the Reset App State side-menu link.
  private readonly resetLink: Locator;

  // Build the component, scoping its root to the header container.
  constructor(page: Page) {
    // Initialise BaseComponent with the header container as the root.
    super(page, page.locator('.header_container'));
    // Resolve the cart link.
    this.cartLink = page.locator('.shopping_cart_link');
    // Resolve the cart badge.
    this.cartBadge = page.locator('.shopping_cart_badge');
    // Use the stable ids: the accessible-name match for the burger is finicky
    // and slow on WebKit/Firefox, causing intermittent click timeouts.
    this.burgerButton = page.locator('#react-burger-menu-btn');
    // Resolve the burger close button by id.
    this.closeButton = page.locator('#react-burger-cross-btn');
    // Resolve the Logout link by id.
    this.logoutLink = page.locator('#logout_sidebar_link');
    // Resolve the Reset App State link by id.
    this.resetLink = page.locator('#reset_sidebar_link');
  }

  /**
   * Purpose: Read the cart item count shown on the badge.
   * @returns Promise resolving to the badge number, or 0 when no badge is shown.
   * @example expect(await header.cartCount()).toBe(2);
   */
  // Read the cart badge count (0 when no badge is shown).
  public async cartCount(): Promise<number> {
    // No badge → zero items.
    if (!(await this.cartBadge.isVisible())) return 0;
    // Read the badge text, trimmed (default '0').
    const text = (await this.cartBadge.textContent())?.trim() ?? '0';
    // Parse it to an integer.
    return Number.parseInt(text, 10);
  }

  /**
   * Purpose: Navigate to the cart by clicking the cart link.
   * @returns Promise that resolves once the cart link is clicked.
   */
  // Open the cart by clicking the cart link.
  public async openCart(): Promise<void> {
    // Trace the action.
    this.log.debug('Opening cart');
    // Click the cart link.
    await this.cartLink.click();
  }

  /**
   * Purpose: Log the user out via the burger (side) menu.
   * @returns Promise that resolves once the logout link is clicked.
   */
  // Log out via the burger side-menu.
  public async logout(): Promise<void> {
    // Trace the logout.
    this.log.debug('Logging out via burger menu');
    // Open the burger menu.
    await this.burgerButton.click();
    // The menu items are always in the DOM with bound click handlers; the sliding
    // panel's animation makes a normal click flaky on WebKit/Firefox (15s
    // actionability timeouts), so dispatch the click directly to the link.
    await this.logoutLink.dispatchEvent('click');
  }

  /**
   * Purpose: Reset the application state (clears the cart and resets product
   * buttons) via the burger menu. Does NOT assert.
   * @returns Promise that resolves once the reset link is clicked.
   */
  // Reset the application state via the burger side-menu.
  public async resetAppState(): Promise<void> {
    // Trace the reset.
    this.log.debug('Resetting app state via burger menu');
    // Open the burger menu.
    await this.burgerButton.click();
    // Dispatch directly — the menu's slide animation makes a normal click flaky
    // on WebKit/Firefox (see logout()).
    await this.resetLink.dispatchEvent('click');
    // Close the menu (dispatch the close click for the same reason).
    await this.closeButton.dispatchEvent('click');
  }
}
