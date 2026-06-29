/**
 * --------------------------------------------------------
 * File: pet.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Swagger Petstore Pet API (CRUD + status filtering).
 * Business Scenario: A pet can be created, fetched, updated, and removed reliably.
 * Preconditions: Network access to the public Petstore sandbox.
 * Test Strategy: CRUD lifecycle + schema validation with retry for consistency.
 * Expected Outcome: Filtered reads match the contract and CRUD completes cleanly.
 * Priority: High
 * Tags: @api @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Petstore is a shared eventually-consistent sandbox; writes are polled via retryAsync.
 * --------------------------------------------------------
 *
 * Swagger Petstore API — CRUD, status filtering, schema, eventual consistency.
 * Petstore is a shared sandbox, so we poll after writes. Tagged @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { PET_SCHEMA } from '@schemas/index';
import { PetStatus } from '@models/petstore.model';
import { retryAsync } from '@utils/retry.util';

test.describe('Swagger Petstore · Pet API @api', () => {
  test('@smoke findByStatus(available) filters correctly + schema', async ({ petApi }) => {
    const res = await petApi.findByStatus(PetStatus.AVAILABLE);
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(8000);
    expect(res.body.length).toBeGreaterThan(0);
    // sample the first few and verify the contract + filter correctness
    for (const pet of res.body.slice(0, 5)) {
      ResponseValidator.for({ ...res, body: pet }).matchesSchema(PET_SCHEMA);
      expect(pet.status).toBe(PetStatus.AVAILABLE);
    }
  });

  test('create → get → update status → delete (full CRUD)', async ({ petApi, data }) => {
    const id = data.int(900_000_000, 999_999_999);
    const name = `qa-pet-${data.uuid().slice(0, 6)}`;

    const created = await petApi.create({
      id,
      name,
      status: PetStatus.AVAILABLE,
      photoUrls: ['https://example.test/p.png'],
    });
    ResponseValidator.for(created).status(HttpStatus.OK).matchesSchema(PET_SCHEMA);

    // Petstore is eventually consistent — poll until the pet is retrievable.
    const fetched = await retryAsync(
      async () => {
        const r = await petApi.getById(id);
        if (r.status !== HttpStatus.OK) throw new Error(`not yet available (${r.status})`);
        return r;
      },
      { retries: 5, delayMs: 500, label: 'pet getById' },
    );
    expect(fetched.body.name).toBe(name);

    const updated = await petApi.update({ id, name, status: PetStatus.SOLD, photoUrls: [] });
    ResponseValidator.for(updated).status(HttpStatus.OK);
    expect(updated.body.status).toBe(PetStatus.SOLD);

    const del = await petApi.remove(id);
    expect(del.status).toBe(HttpStatus.OK);
  });
});
