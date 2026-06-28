/**
 * --------------------------------------------------------
 * File: page.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Second link in the fixture chain — injects ready-to-use Page Objects and
 * UI flows (SauceDemo, OrangeHRM) into tests.
 *
 * Responsibilities:
 * - Extend base.fixtures with TEST-scoped page-object fixtures.
 * - Bind each page object to the current test's `page` instance.
 *
 * Used By:
 * api.fixtures.ts (extends this), and all UI specs via @fixtures/index.
 *
 * Dependencies:
 * @fixtures/base.fixtures (chain parent), @pages/* and @flows/* page objects.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Open/Closed: we ADD fixtures here, never modify the base. Each page object
 * is TEST-scoped (fresh per test) so it is bound to that test's isolated
 * `page` and carries no cross-test state.
 * --------------------------------------------------------
 *
 * FIXTURE FLOW: base.fixtures → page.fixtures (here) → api.fixtures → db.fixtures
 *
 *   test('...', async ({ sauceLoginPage, sauceInventoryPage }) => { ... });
 */
import { test as base } from '@fixtures/base.fixtures';
import { SauceLoginPage } from '@pages/saucedemo/login.page';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import { SauceProductDetailsPage } from '@pages/saucedemo/product-details.page';
import { SauceCartPage } from '@pages/saucedemo/cart.page';
import { CheckoutInfoPage } from '@pages/saucedemo/checkout-info.page';
import { CheckoutOverviewPage } from '@pages/saucedemo/checkout-overview.page';
import { CheckoutCompletePage } from '@pages/saucedemo/checkout-complete.page';
import { CheckoutFlow } from '@flows/saucedemo/checkout.flow';
import { OrangeLoginPage } from '@pages/orangehrm/login.page';
import { OrangeDashboardPage } from '@pages/orangehrm/dashboard.page';
import { OrangePimPage } from '@pages/orangehrm/pim.page';
import { OrangeAddEmployeePage } from '@pages/orangehrm/add-employee.page';

export interface PageFixtures {
  readonly sauceLoginPage: SauceLoginPage;
  readonly sauceInventoryPage: SauceInventoryPage;
  readonly sauceProductDetailsPage: SauceProductDetailsPage;
  readonly sauceCartPage: SauceCartPage;
  readonly sauceCheckoutInfoPage: CheckoutInfoPage;
  readonly sauceCheckoutOverviewPage: CheckoutOverviewPage;
  readonly sauceCheckoutCompletePage: CheckoutCompletePage;
  readonly checkoutFlow: CheckoutFlow;
  readonly orangeLoginPage: OrangeLoginPage;
  readonly orangeDashboardPage: OrangeDashboardPage;
  readonly orangePimPage: OrangePimPage;
  readonly orangeAddEmployeePage: OrangeAddEmployeePage;
}

export const test = base.extend<PageFixtures>({
  sauceLoginPage: async ({ page }, use) => {
    await use(new SauceLoginPage(page));
  },
  sauceInventoryPage: async ({ page }, use) => {
    await use(new SauceInventoryPage(page));
  },
  sauceProductDetailsPage: async ({ page }, use) => {
    await use(new SauceProductDetailsPage(page));
  },
  sauceCartPage: async ({ page }, use) => {
    await use(new SauceCartPage(page));
  },
  sauceCheckoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  sauceCheckoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  sauceCheckoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  checkoutFlow: async ({ page }, use) => {
    await use(new CheckoutFlow(page));
  },
  orangeLoginPage: async ({ page }, use) => {
    await use(new OrangeLoginPage(page));
  },
  orangeDashboardPage: async ({ page }, use) => {
    await use(new OrangeDashboardPage(page));
  },
  orangePimPage: async ({ page }, use) => {
    await use(new OrangePimPage(page));
  },
  orangeAddEmployeePage: async ({ page }, use) => {
    await use(new OrangeAddEmployeePage(page));
  },
});

export { expect } from '@fixtures/base.fixtures';
