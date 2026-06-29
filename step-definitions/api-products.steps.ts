/**
 * --------------------------------------------------------
 * File: api-products.steps.ts
 * Module: Step Definitions
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: DummyJSON Products API BDD steps.
 * Business Scenario: Gherkin product scenarios drive the ProductAPI service.
 * Test Strategy: BDD glue reusing ProductAPI; generic Thens handle status/schema.
 * Priority: High
 * Tags: (driven by features/api/products.feature)
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { productApi } from './support/api.support';
import type { CustomWorld } from '@bdd/world';

interface ProductListBody {
  products: ReadonlyArray<Record<string, unknown>>;
}

const listBody = (world: CustomWorld): ProductListBody =>
  (world.get('response') as { body: ProductListBody }).body;

// ------------------------------------------------------------------- actions
When('I request product {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await productApi(this).getById(id));
});

When(
  'I request {int} products skipping {int}',
  async function (this: CustomWorld, limit: number, skip: number) {
    this.set('response', await productApi(this).list(limit, skip));
  },
);

When('I search products for {string}', async function (this: CustomWorld, query: string) {
  this.set('response', await productApi(this).search(query));
});

When(
  'I list products sorted by {string} in {string} order',
  async function (this: CustomWorld, field: string, direction: string) {
    this.set(
      'response',
      await productApi(this).listSorted(field as never, direction === 'desc' ? 'desc' : 'asc'),
    );
  },
);

// ---------------------------------------------------------------- assertions
Then('the response should contain {int} products', function (this: CustomWorld, count: number) {
  expect(listBody(this).products).toHaveLength(count);
});

Then('the search should return at least one product', function (this: CustomWorld) {
  expect(listBody(this).products.length).toBeGreaterThan(0);
});

Then(
  'the products should be sorted by {string} in {string} order',
  function (this: CustomWorld, field: string, direction: string) {
    const values = listBody(this).products.map((p) => p[field]);
    // DummyJSON sorts by raw UTF-16 code unit (case-sensitive), not locale —
    // match that oracle rather than localeCompare so the expectation aligns.
    const expected = [...values].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      const sa = String(a);
      const sb = String(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
    if (direction === 'desc') expected.reverse();
    expect(values).toEqual(expected);
  },
);
