/**
 * --------------------------------------------------------
 * File: product-crud.e2e.spec.ts
 * Module: E2E Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Full cross-layer product lifecycle (API → DB → update → delete).
 * Business Scenario: A product flows from the catalog API into the DB, is updated,
 *                    reconciled, and removed — proving end-to-end data integrity.
 * Preconditions: Network access to DummyJSON; reachable, provisioned PostgreSQL.
 * Test Strategy: Multi-step API+DB pipeline with verify-after-every-mutation and
 *                a multi-record sync parity check.
 * Expected Outcome: DB mirrors the API at each step; deletes are idempotent.
 * Priority: High
 * Tags: @e2e
 *
 * Last Updated: 2026-06-28
 * Notes: Complements api-to-db-sync.e2e.spec.ts (basic sync) with the full
 * create→update→delete cycle and multi-product parity. Auto-skips without a DB.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { isDatabaseReachable } from '@database/db-availability';

let dbUp = false;

test.beforeAll(async () => {
  dbUp = await isDatabaseReachable();
});

test.beforeEach(() => {
  test.skip(!dbUp, 'No PostgreSQL reachable — run scripts/db/provision.sh');
});

test.describe('E2E · Product full CRUD across API and DB @e2e', () => {
  test('@smoke API → DB → update → delete → verify gone', async ({
    productApi,
    productRecordRepo,
  }) => {
    const source = (await productApi.getById(7)).body;
    try {
      // CREATE: sync the API product into the DB.
      await productRecordRepo.upsert({
        externalId: source.id,
        title: source.title,
        price: source.price,
        category: source.category,
      });
      let record = await productRecordRepo.findByExternalId(source.id);
      expect(record?.title).toBe(source.title);

      // UPDATE: a price change re-syncs in place.
      await productRecordRepo.upsert({
        externalId: source.id,
        title: source.title,
        price: source.price + 5,
        category: source.category,
      });
      record = await productRecordRepo.findByExternalId(source.id);
      expect(Number(record?.price)).toBeCloseTo(source.price + 5, 2);

      // DELETE: remove and confirm it is gone.
      expect(await productRecordRepo.deleteByExternalId(source.id)).toBe(1);
      expect(await productRecordRepo.findByExternalId(source.id)).toBeNull();
    } finally {
      await productRecordRepo.deleteByExternalId(source.id);
    }
  });

  test('multiple API products sync into the DB (parity)', async ({
    productApi,
    productRecordRepo,
  }) => {
    const products = (await productApi.list(3, 0)).body.products;
    expect(products).toHaveLength(3);
    try {
      for (const p of products) {
        await productRecordRepo.upsert({
          externalId: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
        });
      }
      // Every API product must now exist in the DB with a matching title.
      for (const p of products) {
        const record = await productRecordRepo.findByExternalId(p.id);
        expect(record?.title).toBe(p.title);
      }
    } finally {
      for (const p of products) await productRecordRepo.deleteByExternalId(p.id);
    }
  });

  test('deleting an already-removed product is a safe no-op', async ({
    productApi,
    productRecordRepo,
  }) => {
    const source = (await productApi.getById(9)).body;
    await productRecordRepo.upsert({
      externalId: source.id,
      title: source.title,
      price: source.price,
      category: source.category,
    });
    expect(await productRecordRepo.deleteByExternalId(source.id)).toBe(1);
    // Second delete affects zero rows — idempotent across the layers.
    expect(await productRecordRepo.deleteByExternalId(source.id)).toBe(0);
  });
});
