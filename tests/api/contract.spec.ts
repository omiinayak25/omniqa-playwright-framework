/**
 * --------------------------------------------------------
 * File: contract.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Cross-provider response contracts (DummyJSON, JSONPlaceholder, Petstore).
 * Business Scenario: Provider response shapes must stay stable for downstream consumers.
 * Preconditions: Network access to each provider; AJV schemas in @schemas.
 * Test Strategy: Contract / JSON-schema validation against captured responses.
 * Expected Outcome: Every response validates against its declared schema.
 * Priority: High
 * Tags: @api @contract
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Contract testing — validate each service's response shape against a JSON
 * schema (AJV). Catches breaking shape changes from providers. Tagged @api @contract.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { PRODUCT_SCHEMA, PRODUCT_LIST_SCHEMA, POST_SCHEMA, PET_SCHEMA } from '@schemas/index';
import { PetStatus } from '@models/petstore.model';

test.describe('Contract / schema validation @api @contract', () => {
  test('DummyJSON product list conforms to schema', async ({ productApi }) => {
    const res = await productApi.list(5, 0);
    ResponseValidator.for(res).status(HttpStatus.OK).matchesSchema(PRODUCT_LIST_SCHEMA);
  });

  test('DummyJSON single product conforms to schema', async ({ productApi }) => {
    const res = await productApi.getById(1);
    ResponseValidator.for(res).matchesSchema(PRODUCT_SCHEMA);
  });

  test('JSONPlaceholder post conforms to schema', async ({ postApi }) => {
    const res = await postApi.getPost(1);
    ResponseValidator.for(res).matchesSchema(POST_SCHEMA);
  });

  test('Petstore pet conforms to schema', async ({ petApi }) => {
    const res = await petApi.findByStatus(PetStatus.AVAILABLE);
    const first = res.body[0];
    expect(first).toBeDefined();
    ResponseValidator.for({ ...res, body: first }).matchesSchema(PET_SCHEMA);
  });
});
