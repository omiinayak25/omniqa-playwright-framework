/**
 * --------------------------------------------------------
 * File: sla-and-sorting.spec.ts
 * Module: API Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Response-time SLA + server-side sorting (DummyJSON/JSONPlaceholder).
 * Business Scenario: APIs must respond within SLA and sort results correctly.
 * Preconditions: Network access to the public APIs under test.
 * Test Strategy: Performance threshold checks + sort-order oracle verification.
 * Expected Outcome: Responses stay under SLA and returned order matches the oracle.
 * Priority: Medium
 * Tags: @api @perf
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Response-time SLA + server-side sorting. Tagged @api @perf.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

const SLA_MS = 5000;

test.describe('Response-time SLA @api @perf', () => {
  test('product list responds within SLA', async ({ productApi }) => {
    const res = await productApi.list(10, 0);
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(SLA_MS);
    test.info().annotations.push({ type: 'perf', description: `${res.responseTimeMs}ms` });
  });

  test('post list responds within SLA', async ({ postApi }) => {
    const res = await postApi.listPosts();
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(SLA_MS);
    test.info().annotations.push({ type: 'perf', description: `${res.responseTimeMs}ms` });
  });
});

test.describe('Server-side sorting @api', () => {
  test('products sorted by price ascending', async ({ productApi }) => {
    const res = await productApi.listSorted('price', 'asc', 10);
    ResponseValidator.for(res).ok();
    const prices = res.body.products.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('products sorted by title descending', async ({ productApi }) => {
    const res = await productApi.listSorted('title', 'desc', 10);
    ResponseValidator.for(res).ok();
    const titles = res.body.products.map((p) => p.title);
    // DummyJSON sorts by raw UTF-16 code unit (case-sensitive), not locale —
    // match that oracle, not localeCompare.
    const sorted = [...titles].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    expect(titles).toEqual(sorted);
  });
});
