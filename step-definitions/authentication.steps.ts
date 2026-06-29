/**
 * --------------------------------------------------------
 * File: authentication.steps.ts
 * Module: Step Definitions
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo authentication BDD steps (login, logout, session).
 * Business Scenario: Gherkin authentication scenarios drive the SauceDemo POM.
 * Preconditions: CustomWorld with an active page; SauceDemo page objects available.
 * Test Strategy: BDD step glue reusing existing POM/components (no duplication).
 * Expected Outcome: Given/When/Then map cleanly to page-object actions/assertions.
 * Priority: High
 * Tags: (driven by features/authentication/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Authentication step definitions — backs every feature under
 * features/authentication/. Steps reuse the SAME page objects/components as the
 * Playwright-Test specs; no selectors or Playwright calls leak into Gherkin.
 * `this` is the per-scenario CustomWorld.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SauceLoginPage } from '@pages/saucedemo/login.page';
import { SauceInventoryPage } from '@pages/saucedemo/inventory.page';
import { SauceHeaderComponent } from '@components/saucedemo/header.component';
import { config } from '@config/config';
import type { CustomWorld } from '@bdd/world';

// The single valid SauceDemo password (all demo users share it).
const VALID_PASSWORD = config.ui.sauceDemo.credentials.password;

// --------------------------------------------------------------- navigation
Given('I am on the SauceDemo login page', async function (this: CustomWorld) {
  const loginPage = new SauceLoginPage(this.page);
  this.set('loginPage', loginPage);
  await loginPage.open();
  expect(await loginPage.isLoaded()).toBe(true);
});

// ------------------------------------------------------------- sign-in actions
When('I sign in with valid credentials', async function (this: CustomWorld) {
  await this.get<SauceLoginPage>('loginPage').loginAsStandardUser();
});

When('I sign in as {string}', async function (this: CustomWorld, username: string) {
  await this.get<SauceLoginPage>('loginPage').login({ username, password: VALID_PASSWORD });
});

When(
  'I sign in as {string} with password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.get<SauceLoginPage>('loginPage').login({ username, password });
  },
);

When(
  'I attempt to sign in with username {string} and password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.get<SauceLoginPage>('loginPage').login({ username, password });
  },
);

// ------------------------------------------------------------------- sign-out
When('I sign out', async function (this: CustomWorld) {
  await new SauceHeaderComponent(this.page).logout();
});

// ----------------------------------------------------- direct catalog access
When('I open the product catalog directly', async function (this: CustomWorld) {
  await new SauceInventoryPage(this.page).open();
});

When('I try to open the product catalog directly', async function (this: CustomWorld) {
  await new SauceInventoryPage(this.page).open();
});

// ----------------------------------------------------------------- assertions
Then('I should see the product catalog', async function (this: CustomWorld) {
  expect(await new SauceInventoryPage(this.page).isLoaded()).toBe(true);
});

Then('I should see {int} products available', async function (this: CustomWorld, count: number) {
  expect(await new SauceInventoryPage(this.page).itemCount()).toBe(count);
});

Then('access should be {string}', async function (this: CustomWorld, outcome: string) {
  if (outcome === 'granted') {
    expect(await new SauceInventoryPage(this.page).isLoaded()).toBe(true);
  } else {
    expect(await this.get<SauceLoginPage>('loginPage').errorMessage()).not.toBe('');
  }
});

Then(
  'I should be denied access with the message {string}',
  async function (this: CustomWorld, message: string) {
    expect(await this.get<SauceLoginPage>('loginPage').errorMessage()).toContain(message);
  },
);

Then('I should remain on the SauceDemo login page', async function (this: CustomWorld) {
  expect(await this.get<SauceLoginPage>('loginPage').isLoaded()).toBe(true);
});

Then('the password field should mask the entered value', async function (this: CustomWorld) {
  expect(await this.get<SauceLoginPage>('loginPage').passwordInputType()).toBe('password');
});

Then('I should be returned to the SauceDemo login page', async function (this: CustomWorld) {
  expect(await new SauceLoginPage(this.page).isLoaded()).toBe(true);
});

Then('access should require signing in again', async function (this: CustomWorld) {
  // After signing out, opening the catalog directly bounces back to the login
  // screen, so the login form being present proves access now requires re-auth.
  expect(await new SauceLoginPage(this.page).isLoaded()).toBe(true);
});
