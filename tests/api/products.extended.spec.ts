/**
 * --------------------------------------------------------
 * File: products.extended.spec.ts
 * Module: API Tests · Inventory (catalog data integrity)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: DummyJSON Product API — schema & catalog-data integrity.
 * Business Scenario: The catalog API must return well-typed products with sane
 *                    price/stock/rating values, and 404 for unknown ids.
 * Preconditions: Network access to DummyJSON.
 * Test Strategy: Schema/type validation + boundary checks + negative lookup.
 * Expected Outcome: Valid schema & ranges; 404 for a non-existent product.
 * Priority: Medium
 * Tags: @api @regression @inventory
 *
 * Last Updated: 2026-06-28
 * Notes: Complements products.spec.ts (pagination/search/create) — no overlap.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

test.describe('DummyJSON · Product catalog integrity @api @regression @inventory', () => {
  test('@smoke a product has a valid schema and types', async ({ productApi }) => {
    const res = await productApi.getById(1);
    ResponseValidator.for(res).status(HttpStatus.OK);

    const p = res.body;
    expect(typeof p.id).toBe('number');
    expect(typeof p.title).toBe('string');
    expect(p.title.length).toBeGreaterThan(0);
    expect(typeof p.price).toBe('number');
    expect(typeof p.category).toBe('string');
    expect(typeof p.stock).toBe('number');
    expect(typeof p.rating).toBe('number');
  });

  test('an unknown product id returns 404', async ({ productApi }) => {
    const res = await productApi.getById(999_999);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  test('all listed products have a positive price', async ({ productApi }) => {
    const res = await productApi.list(30, 0);
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products.every((p) => p.price > 0)).toBe(true);
  });

  test('all listed products have non-negative stock', async ({ productApi }) => {
    const res = await productApi.list(30, 0);
    expect(res.body.products.every((p) => Number.isFinite(p.stock) && p.stock >= 0)).toBe(true);
  });

  test('product ratings fall within the 0–5 range', async ({ productApi }) => {
    const res = await productApi.list(30, 0);
    expect(res.body.products.every((p) => p.rating >= 0 && p.rating <= 5)).toBe(true);
  });

  test('pagination total is consistent with the page size', async ({ productApi }) => {
    const res = await productApi.list(5, 0);
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.limit).toBe(5);
    expect(res.body.products.length).toBeLessThanOrEqual(5);
    expect(res.body.total).toBeGreaterThanOrEqual(res.body.products.length);
  });
});
