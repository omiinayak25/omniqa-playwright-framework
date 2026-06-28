/**
 * --------------------------------------------------------
 * File: api-users.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: ReqRes Users API BDD steps.
 * Business Scenario: Gherkin user scenarios drive the UserAPI service.
 * Test Strategy: BDD glue reusing UserAPI (x-api-key via ApiClient default header).
 * Priority: Medium
 * Tags: (driven by features/api/users.feature)
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { userApi } from './support/api.support';
import type { CustomWorld } from '@bdd/world';

const body = (world: CustomWorld): Record<string, unknown> =>
  (world.get('response') as { body: Record<string, unknown> }).body;

// ------------------------------------------------------------------- actions
When('I request the user list for page {int}', async function (this: CustomWorld, page: number) {
  this.set('response', await userApi(this).list(page));
});

When('I request user {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await userApi(this).getById(id));
});

When(
  'I create a user named {string} with job {string}',
  async function (this: CustomWorld, name: string, job: string) {
    this.set('response', await userApi(this).create({ name, job }));
  },
);

When('I update user {int} to job {string}', async function (this: CustomWorld, id: number, job: string) {
  this.set('response', await userApi(this).update(id, { name: 'OmniQA', job }));
});

When('I delete user {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await userApi(this).remove(id));
});

// ---------------------------------------------------------------- assertions
Then('the user list should include pagination metadata', function (this: CustomWorld) {
  const b = body(this);
  expect(b.page).toBeDefined();
  expect(b.per_page).toBeDefined();
  expect(b.total).toBeDefined();
});

Then('the created user should have an id', function (this: CustomWorld) {
  expect(body(this).id).toBeTruthy();
});
