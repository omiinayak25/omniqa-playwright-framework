/**
 * --------------------------------------------------------
 * File: authorization.spec.ts
 * Module: API Tests · Authorization
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Restful-Booker write-operation authorization.
 * Business Scenario: Mutating a booking requires a valid token; missing or
 *                    forged tokens must be rejected, while reads/creates stay
 *                    open. Error bodies must not leak internals.
 * Preconditions: Network access to Restful-Booker.
 * Test Strategy: Negative authorization (no/invalid token → 403) plus positive
 *                control (valid token → 200) and an open-endpoint control.
 * Expected Outcome: 403 for unauthorised writes; 200 for authorised writes.
 * Priority: High
 * Tags: @api @regression @authorization @security
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Complements booking.spec.ts (which covers the positive token path) with the
 * missing negative-authorization coverage. No duplication.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { HttpStatus } from '@constants/index';
import { config } from '@config/config';
import { BookingFactory } from '@factories/index';

test.describe('Restful-Booker · Authorization @api @regression @authorization @security', () => {
  // Warm the free dyno once so the first real call isn't a cold start.
  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    await ctx
      .post(`${config.api.restfulBooker.baseUrl}/auth`, {
        data: config.api.restfulBooker.credentials,
        timeout: 30_000,
      })
      .catch(() => undefined);
    await ctx.dispose();
  });

  test('@smoke a booking can be created without a token (open endpoint)', async ({
    bookingApi,
  }) => {
    const res = await bookingApi.create(BookingFactory.valid());
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.bookingid).toBeTruthy();
  });

  test('update without a token is forbidden (403)', async ({ bookingApi }) => {
    const { body } = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.update(body.bookingid, BookingFactory.valid(), '');
    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  test('update with a forged token is forbidden (403)', async ({ bookingApi }) => {
    const { body } = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.update(body.bookingid, BookingFactory.valid(), 'not-a-real-token');
    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  test('delete without a token is forbidden (403)', async ({ bookingApi }) => {
    const { body } = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.remove(body.bookingid, '');
    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  test('update with a valid token is authorised (200)', async ({ bookingApi, authApi }) => {
    const token = await authApi.getBookerToken();
    expect(token).toBeTruthy();

    const { body } = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.update(body.bookingid, BookingFactory.valid(), token);
    expect(res.status).toBe(HttpStatus.OK);
  });

  test('forbidden response body does not leak a stack trace', async ({ bookingApi }) => {
    const { body } = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.remove(body.bookingid, '');
    expect(res.status).toBe(HttpStatus.FORBIDDEN);
    // No file paths / stack frames / Error objects in the error body.
    expect(String(res.body)).not.toMatch(/\bat\s+.*:\d+:\d+/);
    expect(String(res.body)).not.toContain('Error:');
  });
});
