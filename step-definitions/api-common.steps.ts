/**
 * --------------------------------------------------------
 * File: api-common.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Generic API response assertions shared by every domain.
 * Business Scenario: Status, success, response-time SLA, headers and schema are
 *                    asserted the same way regardless of which API was called.
 * Preconditions: A domain step has stored the latest ApiResponse under 'response'.
 * Test Strategy: One reusable assertion vocabulary → zero duplicated Thens.
 * Expected Outcome: Generic Thens read the stored response and assert on it.
 * Priority: High
 * Tags: (driven by features/api/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * CONTRACT: every API "When" step stores its ApiResponse via
 * `this.set('response', res)`. These generic Thens then operate on it.
 */
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { validateSchema } from '@api/schema-validator';
import { SCHEMAS } from './support/api.support';
import type { ApiResponse } from '@models/api.model';
import type { CustomWorld } from '@bdd/world';

function lastResponse(world: CustomWorld): ApiResponse<unknown> {
  return world.get<ApiResponse<unknown>>('response');
}

Then('the response status should be {int}', function (this: CustomWorld, status: number) {
  expect(lastResponse(this).status).toBe(status);
});

Then('the response should be successful', function (this: CustomWorld) {
  expect(lastResponse(this).ok).toBe(true);
});

Then('the response should arrive within {int} ms', function (this: CustomWorld, ms: number) {
  expect(lastResponse(this).responseTimeMs).toBeLessThanOrEqual(ms);
});

Then('the response should include a {string} header', function (this: CustomWorld, name: string) {
  const headerNames = Object.keys(lastResponse(this).headers).map((h) => h.toLowerCase());
  expect(headerNames).toContain(name.toLowerCase());
});

Then('the response body should match the {string} schema', function (this: CustomWorld, name: string) {
  const schema = SCHEMAS[name];
  if (schema === undefined) throw new Error(`Unknown schema "${name}"`);
  const { valid, errors } = validateSchema(schema, lastResponse(this).body);
  expect(valid, errors.join('; ')).toBe(true);
});
