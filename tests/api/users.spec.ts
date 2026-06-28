/**
 * --------------------------------------------------------
 * File: users.spec.ts
 * Module: API Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: ReqRes User API (list/pagination + CRUD).
 * Business Scenario: Users can be listed, created, updated, and deleted.
 * Preconditions: Network access to ReqRes; a registered REQRES_API_KEY.
 * Test Strategy: CRUD lifecycle + pagination + negative lookup.
 * Expected Outcome: Endpoints return expected status codes and payloads.
 * Priority: Medium
 * Tags: @api @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Suite is skipped unless a real REQRES_API_KEY (app.reqres.in) is configured.
 * --------------------------------------------------------
 *
 * ReqRes User API — list/pagination, get, create, update, delete, negative.
 * Tagged @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { config } from '@config/config';

test.describe('ReqRes · User API @api', () => {
  // ReqRes revoked the old public key; these run only when a real key is set.
  test.skip(
    config.api.reqres.apiKey === 'reqres-free-v1' || config.api.reqres.apiKey === '',
    'Set a registered REQRES_API_KEY (app.reqres.in) to enable ReqRes tests',
  );

  test('@smoke lists users with pagination metadata', async ({ userApi }) => {
    const res = await userApi.list(2);
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(5000);
    expect(res.body.page).toBe(2);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('creates a user (POST 201)', async ({ userApi, data }) => {
    const res = await userApi.create({ name: data.fullName(), job: 'QA Engineer' });
    ResponseValidator.for(res).status(HttpStatus.CREATED);
    expect(res.body.id).toBeTruthy();
    expect(res.body.createdAt).toBeTruthy();
  });

  test('updates a user (PUT 200)', async ({ userApi }) => {
    const res = await userApi.update(2, { name: 'Morpheus', job: 'Zion Resident' });
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.job).toBe('Zion Resident');
  });

  test('deletes a user (DELETE 204)', async ({ userApi }) => {
    const res = await userApi.remove(2);
    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });

  test('negative: unknown user returns 404', async ({ userApi }) => {
    const res = await userApi.getById(23_999);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
