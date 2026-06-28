/**
 * --------------------------------------------------------
 * File: api-pets.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Swagger Petstore Pet API BDD steps (request chaining).
 * Business Scenario: Gherkin pet scenarios drive the PetAPI service; the pet id
 *                    and name created in one step are reused by later steps.
 * Test Strategy: BDD glue reusing PetAPI; state carried via the World bag.
 * Priority: Medium
 * Tags: (driven by features/api/pets.feature)
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { petApi } from './support/api.support';
import type { CustomWorld } from '@bdd/world';

const body = (world: CustomWorld): Record<string, unknown> =>
  (world.get('response') as { body: Record<string, unknown> }).body;

// ------------------------------------------------------------------- actions
When('I create a pet named {string}', async function (this: CustomWorld, name: string) {
  // Unique id keeps parallel runs from colliding on the shared public demo.
  const id = Number(`${Date.now()}`.slice(-9));
  this.set('petId', id);
  this.set('petName', name);
  this.set('response', await petApi(this).create({ id, name, status: 'available', photoUrls: [] }));
});

When('I request that pet', async function (this: CustomWorld) {
  this.set('response', await petApi(this).getById(this.get<number>('petId')));
});

When("I update that pet's status to {string}", async function (this: CustomWorld, status: string) {
  this.set(
    'response',
    await petApi(this).update({
      id: this.get<number>('petId'),
      name: this.get<string>('petName'),
      status: status as never,
      photoUrls: [],
    }),
  );
});

When('I delete that pet', async function (this: CustomWorld) {
  this.set('response', await petApi(this).remove(this.get<number>('petId')));
});

When('I find pets with status {string}', async function (this: CustomWorld, status: string) {
  this.set('response', await petApi(this).findByStatus(status as never));
});

// ---------------------------------------------------------------- assertions
Then('the pet should be named {string}', function (this: CustomWorld, name: string) {
  expect(body(this).name).toBe(name);
});

Then('the pet status should be {string}', function (this: CustomWorld, status: string) {
  expect(body(this).status).toBe(status);
});

Then('every returned pet should have status {string}', function (this: CustomWorld, status: string) {
  const pets = (this.get('response') as { body: Array<{ status: string }> }).body;
  expect(Array.isArray(pets)).toBe(true);
  expect(pets.every((p) => p.status === status)).toBe(true);
});
