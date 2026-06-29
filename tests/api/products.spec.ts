/**
 * --------------------------------------------------------
 * File: products.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: DummyJSON Product API (list, get, search, create)
 * Business Scenario: Catalog consumers can page, look up, search, and add products.
 * Preconditions: Network access to the DummyJSON service; custom API fixtures.
 * Test Strategy: Data-driven reads + CRUD create; pagination/search/perf checks.
 * Expected Outcome: Each endpoint returns the expected status, shape, and values.
 * Priority: High
 * Tags: @api @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * DummyJSON Product API — pagination, filtering/search, boundary, perf.
 * Tagged @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

test.describe('DummyJSON · Product API @api', () => {
  test('@smoke paginates with limit & skip', async ({ productApi }) => {
    const res = await productApi.list(5, 10);
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(5000);
    expect(res.body.products).toHaveLength(5);
    expect(res.body.skip).toBe(10);
  });

  test('gets a single product by id', async ({ productApi }) => {
    const res = await productApi.getById(1);
    ResponseValidator.for(res).ok();
    expect(res.body.id).toBe(1);
    expect(res.body.price).toBeGreaterThan(0);
  });

  test('search filters by term', async ({ productApi }) => {
    const res = await productApi.search('phone');
    ResponseValidator.for(res).ok();
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('adds a product (POST)', async ({ productApi, data }) => {
    const title = `QA-${data.uuid().slice(0, 8)}`;
    const res = await productApi.add({ title, price: 99, category: 'test' });
    ResponseValidator.for(res).status(HttpStatus.CREATED);
    expect(res.body.title).toBe(title);
  });
});
