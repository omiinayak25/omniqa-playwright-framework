/**
 * --------------------------------------------------------
 * File: saucedemo.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login BDD steps (Cucumber → page objects).
 * Business Scenario: Gherkin login scenarios drive the same SauceDemo page objects.
 * Preconditions: CustomWorld with an active page; SauceDemo page objects available.
 * Test Strategy: BDD step glue reusing existing POM (no logic duplication).
 * Expected Outcome: Given/When/Then steps map cleanly to page-object actions/assertions.
 * Priority: Medium
 * Tags: (driven by features/saucedemo-login.feature — @ui @saucedemo @smoke @regression)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * SauceDemo UI step definitions — reuse the SAME page objects as the
 * Playwright-Test specs (no duplication). `this` is the CustomWorld.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceLoginPage } from '@pages/saucedemo/login.page';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import type { CustomWorld } from '@bdd/world';

Given('I am on the SauceDemo login page', async function (this: CustomWorld) {
  const loginPage = new SauceLoginPage(this.page);
  this.set('loginPage', loginPage);
  await loginPage.open();
});

When(
  'I log in as {string} with password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    const loginPage = this.get<SauceLoginPage>('loginPage');
    await loginPage.login({ username, password });
  },
);

Then('I should land on the inventory page', async function (this: CustomWorld) {
  const inventory = new SauceInventoryPage(this.page);
  expect(await inventory.isLoaded()).toBe(true);
});

Then('I should see {int} products', async function (this: CustomWorld, count: number) {
  const inventory = new SauceInventoryPage(this.page);
  expect(await inventory.itemCount()).toBe(count);
});

Then('I should see an error containing {string}', async function (this: CustomWorld, msg: string) {
  const loginPage = this.get<SauceLoginPage>('loginPage');
  expect(await loginPage.errorMessage()).toContain(msg);
});

Then('the result should be {string}', async function (this: CustomWorld, outcome: string) {
  const loginPage = this.get<SauceLoginPage>('loginPage');
  if (outcome === 'success') {
    const inventory = new SauceInventoryPage(this.page);
    expect(await inventory.isLoaded()).toBe(true);
  } else {
    expect(await loginPage.errorMessage()).not.toBe('');
  }
});
