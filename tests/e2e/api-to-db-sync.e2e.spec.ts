/**
 * --------------------------------------------------------
 * File: api-to-db-sync.e2e.spec.ts
 * Module: E2E Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Cross-layer API → DB product sync + reconciliation.
 * Business Scenario: A product read from the API must sync into the DB consistently.
 * Preconditions: Network access to DummyJSON; reachable, provisioned PostgreSQL.
 * Test Strategy: Cross-layer pipeline (API source → DB sink) + idempotent upsert.
 * Expected Outcome: DB record matches API source; re-sync produces no duplicate row.
 * Priority: High
 * Tags: @e2e
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Auto-skips every test when no PostgreSQL is reachable; cleans up per test.
 * --------------------------------------------------------
 *
 * E2E · Cross-layer API → DB reconciliation (the showcase).
 *
 * A realistic data-pipeline test: read a product from the DummyJSON *API*
 * (source of truth), sync it into PostgreSQL (*DB* sink), then VERIFY the DB
 * record matches the API source. Also proves the sync is idempotent (upsert).
 * Spans the API layer AND the DB layer. Auto-skips when no DB. Tagged @e2e.
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

test.describe('E2E · API → DB product sync @e2e', () => {
  const externalId = 5;

  test.afterEach(async ({ productRecordRepo }) => {
    if (dbUp) await productRecordRepo.deleteByExternalId(externalId);
  });

  test('reads product from API, syncs to DB, verifies consistency', async ({
    productApi,
    productRecordRepo,
  }) => {
    // 1 · API tier — fetch the source-of-truth product
    const apiRes = await productApi.getById(externalId);
    expect(apiRes.status).toBe(200);
    const source = apiRes.body;

    // 2 · DB tier — sync (upsert) into PostgreSQL
    const synced = await productRecordRepo.upsert({
      externalId: source.id,
      title: source.title,
      price: source.price,
      category: source.category,
    });
    expect(synced.external_id).toBe(source.id);

    // 3 · Reconcile — DB record must match the API source
    const dbRecord = await productRecordRepo.findByExternalId(externalId);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.title).toBe(source.title);
    expect(Number(dbRecord?.price)).toBeCloseTo(source.price, 2);
    expect(dbRecord?.category).toBe(source.category);
  });

  test('re-syncing the same product is idempotent (no duplicate row)', async ({
    productApi,
    productRecordRepo,
  }) => {
    const source = (await productApi.getById(externalId)).body;
    const input = {
      externalId: source.id,
      title: source.title,
      price: source.price,
      category: source.category,
    };

    await productRecordRepo.upsert(input);
    await productRecordRepo.upsert({ ...input, price: source.price + 10 }); // second sync updates

    // Exactly one row for this external_id, with the updated price.
    const record = await productRecordRepo.findByExternalId(externalId);
    expect(Number(record?.price)).toBeCloseTo(source.price + 10, 2);
  });
});
