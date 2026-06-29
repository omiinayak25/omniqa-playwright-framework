/**
 * --------------------------------------------------------
 * File: dummyjson-extended.spec.ts
 * Module: API Tests · Product validation (extended)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: DummyJSON products — sorting, pagination boundaries, CRUD.
 * Business Scenario: The catalog API must page, sort, and create correctly.
 * Preconditions: Network access to DummyJSON.
 * Test Strategy: Server-side sort + boundary pagination + data-driven lookups.
 * Expected Outcome: Sorted/paged/looked-up results match expectations.
 * Priority: Medium
 * Tags: @api @regression
 *
 * Last Updated: 2026-06-28
 * Notes: Complements products.spec / products.extended / products.search.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

test.describe('DummyJSON · Products extended @api @regression', () => {
  test('@smoke default list returns a full page of 30', async ({ productApi }) => {
    const res = await productApi.list();
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.products).toHaveLength(30);
  });

  test('limit=1 returns exactly one product', async ({ productApi }) => {
    const res = await productApi.list(1, 0);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.limit).toBe(1);
  });

  test('skipping beyond the dataset returns no products', async ({ productApi }) => {
    const res = await productApi.list(10, 100_000);
    expect(res.body.products).toHaveLength(0);
  });

  test('ascending and descending title sorts change the ordering', async ({ productApi }) => {
    // Robust across the server's exact comparator/tie-handling: the top of an
    // ascending sort must differ from the top of a descending sort.
    const asc = await productApi.listSorted('title', 'asc', 30);
    const desc = await productApi.listSorted('title', 'desc', 30);
    expect(asc.body.products[0]?.id).not.toBe(desc.body.products[0]?.id);
  });

  test('server-side sort by price descending is ordered', async ({ productApi }) => {
    const res = await productApi.listSorted('price', 'desc', 20);
    const prices = res.body.products.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  for (const id of [1, 5, 10, 15, 20, 25] as const) {
    test(`getById(${id}) returns the matching product`, async ({ productApi }) => {
      const res = await productApi.getById(id);
      ResponseValidator.for(res).status(HttpStatus.OK);
      expect(res.body.id).toBe(id);
    });
  }

  test('adding a product returns a generated id', async ({ productApi, data }) => {
    const res = await productApi.add({ title: `QA ${data.uuid().slice(0, 6)}`, price: 12.5 });
    expect(res.body.id).toBeTruthy();
    expect(res.body.title).toContain('QA');
  });

  test('the list response time is within SLA', async ({ productApi }) => {
    const res = await productApi.list(10, 0);
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(5000);
  });
});
