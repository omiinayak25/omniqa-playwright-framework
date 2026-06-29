/**
 * --------------------------------------------------------
 * File: checkout.validation.spec.ts
 * Module: UI Tests · Checkout (validation)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout step-one required-field validation.
 * Business Scenario: Each missing customer-detail must block continuation with
 *                    the correct message; partial completion must stop at the
 *                    next missing field.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Decision table (presence of first/last/zip) driven by the
 *                CheckoutBuilder invalid variants — no inline literals.
 * Expected Outcome: The right "<field> is required" error appears each time.
 * Priority: High
 * Tags: @ui @regression @negative @checkout
 *
 * Last Updated: 2026-06-28
 * Notes: Mirrors the BDD outline at the Playwright layer using the builder,
 * and adds the partial-completion cases the outline doesn't cover.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { CheckoutBuilder } from '@builders/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const PRODUCT = ['Sauce Labs Backpack'];

// Builder variant → expected validation message (decision table).
const MISSING_FIELD_CASES = [
  {
    label: 'missing first name',
    info: CheckoutBuilder.missingFirstName().build(),
    message: 'First Name is required',
  },
  {
    label: 'missing last name',
    info: CheckoutBuilder.missingLastName().build(),
    message: 'Last Name is required',
  },
  {
    label: 'missing postal code',
    info: CheckoutBuilder.missingPostalCode().build(),
    message: 'Postal Code is required',
  },
];

test.describe('SauceDemo · Checkout validation @ui @regression @negative @checkout', () => {
  for (const c of MISSING_FIELD_CASES) {
    test(`${c.label} → "${c.message}"`, async ({ checkoutFlow, sauceCheckoutInfoPage }) => {
      await checkoutFlow.goToInformation(PRODUCT);
      await sauceCheckoutInfoPage.fillInformation(c.info);
      await sauceCheckoutInfoPage.continue();
      expect(await sauceCheckoutInfoPage.errorMessage()).toContain(c.message);
    });
  }

  test('only the first name filled stops at the last-name requirement', async ({
    checkoutFlow,
    sauceCheckoutInfoPage,
  }) => {
    await checkoutFlow.goToInformation(PRODUCT);
    await sauceCheckoutInfoPage.fillInformation({
      firstName: 'Quality',
      lastName: '',
      postalCode: '',
    });
    await sauceCheckoutInfoPage.continue();
    expect(await sauceCheckoutInfoPage.errorMessage()).toContain('Last Name is required');
  });

  test('first and last name only stops at the postal-code requirement', async ({
    checkoutFlow,
    sauceCheckoutInfoPage,
  }) => {
    await checkoutFlow.goToInformation(PRODUCT);
    await sauceCheckoutInfoPage.fillInformation({
      firstName: 'Quality',
      lastName: 'Assurance',
      postalCode: '',
    });
    await sauceCheckoutInfoPage.continue();
    expect(await sauceCheckoutInfoPage.errorMessage()).toContain('Postal Code is required');
  });
});
