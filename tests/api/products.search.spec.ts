/**
 * --------------------------------------------------------
 * File: products.search.spec.ts
 * Module: API Tests · Search
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: DummyJSON product search (q parameter).
 * Business Scenario: Shoppers search the catalog; matches must be relevant,
 *                    misses must return empty, and adversarial input must be safe.
 * Preconditions: Network access to DummyJSON.
 * Test Strategy: Equivalence partitioning (exact/partial/case/empty/no-result)
 *                + relevance + security, reusing EdgeInputFactory payloads.
 * Expected Outcome: Relevant results for hits, empty for misses, 200 for all.
 * Priority: Medium
 * Tags: @api @regression @search
 *
 * Last Updated: 2026-06-28
 * Notes: Complements products.spec.ts (which only does search('phone')).
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { EdgeInputFactory } from '@factories/index';

const relevant = (text: string, term: string): boolean =>
  text.toLowerCase().includes(term.toLowerCase());

test.describe('DummyJSON · Product search @api @regression @search', () => {
  test('@smoke an exact term returns relevant products', async ({ productApi }) => {
    const res = await productApi.search('laptop');
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.products.length).toBeGreaterThan(0);
    // Every result should reference the term in title, category, or description.
    expect(
      res.body.products.every(
        (p) =>
          relevant(p.title, 'laptop') ||
          relevant(p.category, 'laptop') ||
          relevant(String((p as { description?: string }).description ?? ''), 'laptop'),
      ),
    ).toBe(true);
  });

  test('a partial term returns results', async ({ productApi }) => {
    const res = await productApi.search('lap');
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('search is case-insensitive', async ({ productApi }) => {
    const lower = await productApi.search('watch');
    const upper = await productApi.search('WATCH');
    expect(upper.body.products).toHaveLength(lower.body.products.length);
    expect(upper.body.products.length).toBeGreaterThan(0);
  });

  test('a no-match term returns an empty result set', async ({ productApi }) => {
    const res = await productApi.search('zzzznomatchxyz');
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.products).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  test('special characters are handled without a server error', async ({ productApi }) => {
    const res = await productApi.search('@#$%^&*');
    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('a unicode term is handled gracefully', async ({ productApi }) => {
    const res = await productApi.search('日本語テスト');
    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('an empty query returns a valid product list', async ({ productApi }) => {
    const res = await productApi.search('');
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('search results carry a valid schema', async ({ productApi }) => {
    const res = await productApi.search('phone');
    for (const p of res.body.products) {
      expect(typeof p.id).toBe('number');
      expect(typeof p.title).toBe('string');
      expect(typeof p.price).toBe('number');
    }
  });

  test('a SQLi payload in the query is handled safely', async ({ productApi }) => {
    const res = await productApi.search(EdgeInputFactory.sqlInjection()[0]!.value);
    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('an XSS payload in the query is handled safely', async ({ productApi }) => {
    const res = await productApi.search(EdgeInputFactory.xss()[0]!.value);
    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body.products)).toBe(true);
  });
});
