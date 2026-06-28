# Page Objects — OMNIQA Playwright Framework

- **Purpose** — Page Object Model (POM) layer: each class models a single application screen, exposing locators and intention-revealing actions. Pages hold actions only; business assertions live in tests.

## Files

| File                                  | Responsibility                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `base.page.ts`                        | Abstract POM root: navigation (`open`/`url`/`title`) and logged interaction helpers (click/type/readText/select/waitForUrlContains). |
| `saucedemo/login.page.ts`             | SauceDemo login screen — fill/submit credentials, read error banner.                                                                 |
| `saucedemo/inventory.page.ts`         | SauceDemo products screen — read products, add to cart; composes the header component.                                               |
| `saucedemo/cart.page.ts`              | SauceDemo cart screen — read cart contents and proceed to checkout.                                                                  |
| `saucedemo/checkout-info.page.ts`     | Checkout step one — fill customer information and continue.                                                                          |
| `saucedemo/checkout-overview.page.ts` | Checkout step two — read order totals (subtotal/tax/total) and finish.                                                               |
| `saucedemo/checkout-complete.page.ts` | Order confirmation screen — read confirmation text.                                                                                  |
| `orangehrm/login.page.ts`             | OrangeHRM login screen — credential entry and submission.                                                                            |
| `orangehrm/dashboard.page.ts`         | OrangeHRM landing dashboard reached after login.                                                                                     |
| `orangehrm/pim.page.ts`               | OrangeHRM PIM (employee list) screen — composes data-table and pagination components.                                                |

## Responsibilities

- Encapsulate each screen's locators and screen-specific actions.
- Inherit shared navigation and logged interaction helpers from `BasePage`.
- Compose reusable components (header, data table, pagination) rather than duplicating their selectors.
- Expose state via getters/methods so tests can assert; never assert internally.

## Dependencies

- `@playwright/test` (Page, Locator, Response types)
- `@components/*` (composed widgets), `@config/config`, `@constants/ui-routes.constants`
- `@models/*` (e.g. `UserCredentials`, `CheckoutInfo`), `@utils/logger` (scoped logging)

## Interacts With

- Composed by `@flows` (e.g. `CheckoutFlow`) and injected into specs via `@fixtures/page.fixtures`.
- Used by `tests/ui/*` specs and `tests/setup/*` auth setup.

## Usage Example

```ts
import { SauceLoginPage } from '@pages/saucedemo/login.page';

const login = new SauceLoginPage(page);
await login.open();
await login.loginAsStandardUser();
```
