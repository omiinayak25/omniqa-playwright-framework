/**
 * --------------------------------------------------------
 * File: checkout.flow-extended.spec.ts
 * Module: UI Tests · Checkout (flow)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout navigation & completion side-effects.
 * Business Scenario: Cancelling from the overview returns to shopping; completing
 *                    an order empties the cart and confirms; payment/shipping info
 *                    is surfaced before purchase.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Flow-completion + side-effect assertions beyond the happy path.
 * Expected Outcome: Cancel/return works; cart clears post-order; info displayed.
 * Priority: High
 * Tags: @ui @regression @checkout
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCEDEMO_ROUTES } from '@constants/index';
import { CheckoutBuilder } from '@builders/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const CUSTOMER = CheckoutBuilder.valid().build();

test.describe('SauceDemo · Checkout flow (extended) @ui @regression @checkout', () => {
  test('cancel from the overview returns to the inventory', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
    sauceInventoryPage,
    page,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack'], CUSTOMER);
    await sauceCheckoutOverviewPage.cancel();

    await expect(page).toHaveURL(new RegExp(`${SAUCEDEMO_ROUTES.INVENTORY}$`));
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
  });

  test('payment and shipping information are shown on the overview', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack'], CUSTOMER);
    expect((await sauceCheckoutOverviewPage.paymentInformation()).length).toBeGreaterThan(0);
    expect((await sauceCheckoutOverviewPage.shippingInformation()).length).toBeGreaterThan(0);
  });

  test('completing an order shows confirmation and empties the cart', async ({
    checkoutFlow,
    sauceCheckoutOverviewPage,
    sauceCheckoutCompletePage,
    sauceInventoryPage,
  }) => {
    await checkoutFlow.goToOverview(['Sauce Labs Backpack'], CUSTOMER);
    await sauceCheckoutOverviewPage.finish();

    expect(await sauceCheckoutCompletePage.confirmationText()).toContain(
      'Thank you for your order',
    );

    // The cart badge must be cleared after a completed order.
    await sauceCheckoutCompletePage.backToProducts();
    expect(await sauceInventoryPage.isLoaded()).toBe(true);
    expect(await sauceInventoryPage.header.cartCount()).toBe(0);
  });

  test('a multi-item order completes successfully', async ({ checkoutFlow }) => {
    const confirmation = await checkoutFlow.purchase(
      ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'],
      CUSTOMER,
    );
    expect(confirmation).toContain('Thank you for your order');
  });
});
