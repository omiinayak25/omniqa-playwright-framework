/**
 * --------------------------------------------------------
 * File: api-users.steps.ts
 * Module: Step Definitions
 * Project: OMINQA Playwright Framework
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

/** Pagination metadata the user-list step asserts on. */
interface PaginatedBody {
  readonly page: number;
  readonly per_page: number;
  readonly total: number;
}

/** Created-user body (ReqRes returns a server-assigned id). */
interface CreatedUserBody {
  readonly id: string;
}

const paginatedBody = (world: CustomWorld): PaginatedBody =>
  (world.get('response') as { body: PaginatedBody }).body;

const createdUserBody = (world: CustomWorld): CreatedUserBody =>
  (world.get('response') as { body: CreatedUserBody }).body;

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

When(
  'I update user {int} to job {string}',
  async function (this: CustomWorld, id: number, job: string) {
    this.set('response', await userApi(this).update(id, { name: 'OminQA', job }));
  },
);

When('I delete user {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await userApi(this).remove(id));
});

// ---------------------------------------------------------------- assertions
Then('the user list should include pagination metadata', function (this: CustomWorld) {
  const b = paginatedBody(this);
  expect(b.page).toBeDefined();
  expect(b.per_page).toBeDefined();
  expect(b.total).toBeDefined();
});

Then('the created user should have an id', function (this: CustomWorld) {
  expect(createdUserBody(this).id).toBeTruthy();
});
