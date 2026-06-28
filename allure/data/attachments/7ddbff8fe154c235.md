# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility/saucedemo/journey.a11y.spec.ts >> SauceDemo · Journey · Accessibility @a11y @accessibility @regression >> the checkout overview has no violations
- Location: tests/accessibility/saucedemo/journey.a11y.spec.ts:36:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Open Menu' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Swag Labs
  - generic [ref=e5]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - textbox "Username" [ref=e11]
        - img [ref=e12]
      - generic [ref=e14]:
        - textbox "Password" [ref=e15]
        - img [ref=e16]
      - 'heading "Epic sadface: You can only access ''/inventory.html'' when you are logged in." [level=3] [ref=e19]':
        - button [ref=e20] [cursor=pointer]:
          - img [ref=e21]
        - text: "Epic sadface: You can only access '/inventory.html' when you are logged in."
      - button "Login" [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "Accepted usernames are:" [level=4] [ref=e27]
        - text: standard_user
        - text: locked_out_user
        - text: problem_user
        - text: performance_glitch_user
        - text: error_user
        - text: visual_user
      - generic [ref=e28]:
        - heading "Password for all users:" [level=4] [ref=e29]
        - text: secret_sauce
```

# Test source

```ts
  1  | /**
  2  |  * --------------------------------------------------------
  3  |  * File: header.component.ts
  4  |  * Module: UI Components
  5  |  * Project: OMNIQA Playwright Framework
  6  |  *
  7  |  * Purpose:
  8  |  * Models the persistent SauceDemo top bar (burger menu + shopping-cart link
  9  |  * with item-count badge). Reused by every authenticated SauceDemo page via
  10 |  * composition.
  11 |  *
  12 |  * Responsibilities:
  13 |  * - Report the cart item count from the badge
  14 |  * - Open the cart
  15 |  * - Log out via the burger menu
  16 |  *
  17 |  * Used By:
  18 |  * inventory.page.ts (SauceInventoryPage.header) and, through it,
  19 |  * checkout.flow.ts / saucedemo specs
  20 |  *
  21 |  * Dependencies:
  22 |  * Playwright (Page, Locator), BaseComponent (@components/base.component)
  23 |  *
  24 |  * Last Updated: 2026-06-27
  25 |  * --------------------------------------------------------
  26 |  */
  27 | import type { Page, Locator } from '@playwright/test';
  28 | import { BaseComponent } from '@components/base.component';
  29 | 
  30 | /**
  31 |  * SauceHeaderComponent is a composition unit embedded by SauceDemo pages so the
  32 |  * shared top-bar interactions (cart, logout) are defined once and reused.
  33 |  */
  34 | export class SauceHeaderComponent extends BaseComponent {
  35 |   private readonly cartLink: Locator;
  36 |   private readonly cartBadge: Locator;
  37 |   private readonly burgerButton: Locator;
  38 |   private readonly closeButton: Locator;
  39 |   private readonly logoutLink: Locator;
  40 |   private readonly resetLink: Locator;
  41 | 
  42 |   constructor(page: Page) {
  43 |     super(page, page.locator('.header_container'));
  44 |     this.cartLink = page.locator('.shopping_cart_link');
  45 |     this.cartBadge = page.locator('.shopping_cart_badge');
  46 |     this.burgerButton = page.getByRole('button', { name: 'Open Menu' });
  47 |     this.closeButton = page.locator('#react-burger-cross-btn');
  48 |     this.logoutLink = page.locator('#logout_sidebar_link');
  49 |     this.resetLink = page.locator('#reset_sidebar_link');
  50 |   }
  51 | 
  52 |   /**
  53 |    * Purpose: Read the cart item count shown on the badge.
  54 |    * @returns Promise resolving to the badge number, or 0 when no badge is shown.
  55 |    * @example expect(await header.cartCount()).toBe(2);
  56 |    */
  57 |   public async cartCount(): Promise<number> {
  58 |     if (!(await this.cartBadge.isVisible())) return 0;
  59 |     const text = (await this.cartBadge.textContent())?.trim() ?? '0';
  60 |     return Number.parseInt(text, 10);
  61 |   }
  62 | 
  63 |   /**
  64 |    * Purpose: Navigate to the cart by clicking the cart link.
  65 |    * @returns Promise that resolves once the cart link is clicked.
  66 |    */
  67 |   public async openCart(): Promise<void> {
  68 |     this.log.debug('Opening cart');
  69 |     await this.cartLink.click();
  70 |   }
  71 | 
  72 |   /**
  73 |    * Purpose: Log the user out via the burger (side) menu.
  74 |    * @returns Promise that resolves once the logout link is clicked.
  75 |    */
  76 |   public async logout(): Promise<void> {
  77 |     this.log.debug('Logging out via burger menu');
  78 |     await this.burgerButton.click();
  79 |     await this.logoutLink.click();
  80 |   }
  81 | 
  82 |   /**
  83 |    * Purpose: Reset the application state (clears the cart and resets product
  84 |    * buttons) via the burger menu. Does NOT assert.
  85 |    * @returns Promise that resolves once the reset link is clicked.
  86 |    */
  87 |   public async resetAppState(): Promise<void> {
  88 |     this.log.debug('Resetting app state via burger menu');
> 89 |     await this.burgerButton.click();
     |                             ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  90 |     await this.resetLink.click();
  91 |     // SauceDemo leaves the side menu open after a reset; close it so the page
  92 |     // is interactive again for any subsequent action.
  93 |     await this.closeButton.click();
  94 |   }
  95 | }
  96 | 
```