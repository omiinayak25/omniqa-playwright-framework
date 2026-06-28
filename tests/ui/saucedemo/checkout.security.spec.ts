/**
 * --------------------------------------------------------
 * File: checkout.security.spec.ts
 * Module: UI Tests · Checkout (security & boundary inputs)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo checkout form handling of adversarial/boundary input.
 * Business Scenario: Injection payloads must be treated as inert text (no script
 *                    execution, no bypass) and unicode/long values handled gracefully.
 * Preconditions: Stored SauceDemo auth (.auth/saucedemo.json).
 * Test Strategy: Error-guessing + boundary, data-driven from EdgeInputFactory.
 * Expected Outcome: Form accepts the values as literal data and advances safely.
 * Priority: Medium
 * Tags: @ui @regression @security @checkout
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { SAUCEDEMO_ROUTES } from '@constants/index';
import { EdgeInputFactory } from '@factories/index';

test.use({ storageState: SAUCE_AUTH_FILE });

const onOverview = new RegExp(`${SAUCEDEMO_ROUTES.CHECKOUT_STEP_TWO}$`);

test.describe('SauceDemo · Checkout input security @ui @regression @security @checkout', () => {
  test.beforeEach(async ({ checkoutFlow }) => {
    await checkoutFlow.goToInformation(['Sauce Labs Backpack']);
  });

  // XSS payloads in the name field must not execute and must be treated as text.
  for (const payload of EdgeInputFactory.xss().slice(0, 3)) {
    test(`XSS name payload (${payload.label}) is treated as inert text`, async ({
      sauceCheckoutInfoPage,
      page,
    }) => {
      let dialogFired = false;
      page.on('dialog', async (d) => {
        dialogFired = true;
        await d.dismiss();
      });

      await sauceCheckoutInfoPage.fillInformation({
        firstName: payload.value,
        lastName: 'Tester',
        postalCode: '12345',
      });
      await sauceCheckoutInfoPage.continue();

      expect(dialogFired).toBe(false);
      await expect(page).toHaveURL(onOverview);
    });
  }

  test('SQLi payload in the postal code is handled safely', async ({
    sauceCheckoutInfoPage,
    page,
  }) => {
    const payload = EdgeInputFactory.sqlInjection()[0]!;
    await sauceCheckoutInfoPage.fillInformation({
      firstName: 'Quality',
      lastName: 'Assurance',
      postalCode: payload.value,
    });
    await sauceCheckoutInfoPage.continue();
    await expect(page).toHaveURL(onOverview);
  });

  test('unicode names are accepted', async ({ sauceCheckoutInfoPage, page }) => {
    const unicode = EdgeInputFactory.unicode()[0]!;
    await sauceCheckoutInfoPage.fillInformation({
      firstName: unicode.value,
      lastName: unicode.value,
      postalCode: '12345',
    });
    await sauceCheckoutInfoPage.continue();
    await expect(page).toHaveURL(onOverview);
  });

  test('very long names are accepted without breaking the form', async ({
    sauceCheckoutInfoPage,
    page,
  }) => {
    const long = EdgeInputFactory.longString(256);
    await sauceCheckoutInfoPage.fillInformation({
      firstName: long,
      lastName: long,
      postalCode: '12345',
    });
    await sauceCheckoutInfoPage.continue();
    await expect(page).toHaveURL(onOverview);
  });
});
