/**
 * --------------------------------------------------------
 * File: api-negative.steps.ts
 * Module: Step Definitions
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Negative/boundary API BDD steps not covered by a domain.
 * Business Scenario: Drives a deliberately missing resource to assert 404 etc.
 * Test Strategy: Reuses domain services + generic response Thens.
 * Priority: Medium
 * Tags: (driven by features/api/negative.feature)
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Other negative steps (e.g. "I request product 0", "I search products for ...")
 * are REUSED from api-products.steps.ts; only the booking case is new here.
 */
import { When } from '@cucumber/cucumber';
import { bookingApi } from './support/api.support';
import type { CustomWorld } from '@bdd/world';

When('I request a non-existent booking', async function (this: CustomWorld) {
  this.set('response', await bookingApi(this).getById(99_999_999));
});
