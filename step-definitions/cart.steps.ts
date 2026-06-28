/**
 * --------------------------------------------------------
 * File: cart.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo cart BDD steps (add, remove, badge, persistence).
 * Business Scenario: Gherkin cart scenarios drive the inventory/cart Page Objects.
 * Preconditions: Authenticated catalog (Background reuses Authentication steps).
 * Test Strategy: BDD step glue reusing inventory/cart POM + header component.
 * Expected Outcome: Cart steps map cleanly to page-object actions/reads.
 * Priority: High
 * Tags: (driven by features/cart/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Cart step definitions. Sign-in and "I should see the product catalog" steps
 * are REUSED from authentication.steps.ts. `this` is the per-scenario World.
 */
import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import { SauceCartPage } from '@pages/saucedemo/cart.page';
import { SauceHeaderComponent } from '@components/saucedemo/header.component';
import type { CustomWorld } from '@bdd/world';

// ------------------------------------------------------------------- actions
When('I add {string} to the cart', async function (this: CustomWorld, product: string) {
  await new SauceInventoryPage(this.page).addToCart(product);
});

When(
  'I add the following products to the cart:',
  async function (this: CustomWorld, table: DataTable) {
    const inventory = new SauceInventoryPage(this.page);
    for (const [product] of table.raw()) await inventory.addToCart(product);
  },
);

When('I open the cart', async function (this: CustomWorld) {
  await new SauceHeaderComponent(this.page).openCart();
});

When('I remove {string} from the cart', async function (this: CustomWorld, product: string) {
  await new SauceCartPage(this.page).removeItem(product);
});

When('I remove all products from the cart', async function (this: CustomWorld) {
  await new SauceCartPage(this.page).removeAllItems();
});

When('I continue shopping', async function (this: CustomWorld) {
  await new SauceCartPage(this.page).continueShopping();
});

// ---------------------------------------------------------------- assertions
Then('the cart badge should show {int} item(s)', async function (this: CustomWorld, count: number) {
  expect(await new SauceHeaderComponent(this.page).cartCount()).toBe(count);
});

Then('the cart badge should show no items', async function (this: CustomWorld) {
  expect(await new SauceHeaderComponent(this.page).cartCount()).toBe(0);
});

Then('the cart should contain {int} item(s)', async function (this: CustomWorld, count: number) {
  expect(await new SauceCartPage(this.page).itemCount()).toBe(count);
});

Then('the cart should contain {string}', async function (this: CustomWorld, product: string) {
  expect(await new SauceCartPage(this.page).itemNamesList()).toContain(product);
});

Then(
  'the cart should contain the following products:',
  async function (this: CustomWorld, table: DataTable) {
    const expected = table.raw().map(([product]) => product);
    const actual = await new SauceCartPage(this.page).itemNamesList();
    expect(actual).toEqual(expected);
  },
);

Then('the cart should be empty', async function (this: CustomWorld) {
  expect(await new SauceCartPage(this.page).itemCount()).toBe(0);
});
