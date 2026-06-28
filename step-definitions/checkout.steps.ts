/**
 * --------------------------------------------------------
 * File: checkout.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout BDD steps (details, validation, finish).
 * Business Scenario: Gherkin checkout scenarios drive the checkout Page Objects.
 * Preconditions: At the customer-information step (Background reaches it via cart).
 * Test Strategy: BDD step glue reusing checkout POM (no logic duplication).
 * Expected Outcome: Checkout steps map cleanly to page-object actions/reads.
 * Priority: High
 * Tags: (driven by features/checkout/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Checkout step definitions. Sign-in, "I add ... to the cart", "I open the
 * cart", "the cart should contain ...", and "I should see the product catalog"
 * are REUSED from earlier modules. `this` is the per-scenario CustomWorld.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceCartPage } from '@pages/saucedemo/cart.page';
import { CheckoutInfoPage } from '@pages/saucedemo/checkout-info.page';
import { CheckoutOverviewPage } from '@pages/saucedemo/checkout-overview.page';
import { CheckoutCompletePage } from '@pages/saucedemo/checkout-complete.page';
import { CheckoutBuilder } from '@builders/index';
import type { CustomWorld } from '@bdd/world';

// Default valid customer used by the happy-path / totals scenarios — generated
// by the Builder layer instead of a hand-maintained literal.
const VALID_CUSTOMER = CheckoutBuilder.valid().build();

// ------------------------------------------------------------------- actions
When('I proceed to checkout', async function (this: CustomWorld) {
  await new SauceCartPage(this.page).proceedToCheckout();
});

When('I enter valid checkout details', async function (this: CustomWorld) {
  await new CheckoutInfoPage(this.page).fillInformation(VALID_CUSTOMER);
});

When(
  'I enter checkout details with first name {string}, last name {string} and postal code {string}',
  async function (this: CustomWorld, first: string, last: string, zip: string) {
    await new CheckoutInfoPage(this.page).fillInformation({
      firstName: first,
      lastName: last,
      postalCode: zip,
    });
  },
);

When('I continue to the order overview', async function (this: CustomWorld) {
  await new CheckoutInfoPage(this.page).continue();
});

When('I finish the order', async function (this: CustomWorld) {
  await new CheckoutOverviewPage(this.page).finish();
});

When('I cancel the checkout', async function (this: CustomWorld) {
  await new CheckoutInfoPage(this.page).cancel();
});

When('I cancel the order from the overview', async function (this: CustomWorld) {
  await new CheckoutOverviewPage(this.page).cancel();
});

When('I go back to the products', async function (this: CustomWorld) {
  await new CheckoutCompletePage(this.page).backToProducts();
});

// ---------------------------------------------------------------- assertions
Then(
  'the order overview should list {string}',
  async function (this: CustomWorld, product: string) {
    expect(await new CheckoutOverviewPage(this.page).itemNamesList()).toContain(product);
  },
);

Then(
  'I should see a checkout error containing {string}',
  async function (this: CustomWorld, message: string) {
    expect(await new CheckoutInfoPage(this.page).errorMessage()).toContain(message);
  },
);

Then('the order total should equal the subtotal plus tax', async function (this: CustomWorld) {
  const overview = new CheckoutOverviewPage(this.page);
  const [subtotal, tax, total] = await Promise.all([
    overview.subtotal(),
    overview.tax(),
    overview.total(),
  ]);
  expect(total).toBeCloseTo(subtotal + tax, 2);
});

Then('the tax should be 8% of the subtotal', async function (this: CustomWorld) {
  const overview = new CheckoutOverviewPage(this.page);
  const subtotal = await overview.subtotal();
  expect(await overview.tax()).toBeCloseTo(Number((subtotal * 0.08).toFixed(2)), 2);
});

Then(
  'the overview should show payment and shipping information',
  async function (this: CustomWorld) {
    const overview = new CheckoutOverviewPage(this.page);
    expect((await overview.paymentInformation()).length).toBeGreaterThan(0);
    expect((await overview.shippingInformation()).length).toBeGreaterThan(0);
  },
);

Then(
  'I should see the order confirmation {string}',
  async function (this: CustomWorld, message: string) {
    expect(await new CheckoutCompletePage(this.page).confirmationText()).toContain(message);
  },
);
