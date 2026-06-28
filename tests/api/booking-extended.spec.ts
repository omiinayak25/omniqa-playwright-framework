/**
 * --------------------------------------------------------
 * File: booking-extended.spec.ts
 * Module: API Tests · Booking (extended)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Restful-Booker — health, listing, lookup, filter, patch.
 * Business Scenario: The booking API must report health, list/filter ids, and
 *                    reflect created/patched bookings.
 * Preconditions: Network access to Restful-Booker.
 * Test Strategy: Health + create/lookup parity + filtered listing + partial update.
 * Expected Outcome: Health 201; created bookings are retrievable & filterable.
 * Priority: Medium
 * Tags: @api @regression @booking
 *
 * Last Updated: 2026-06-28
 * Notes: Warms the free dyno first; complements booking.spec.ts.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { HttpStatus } from '@constants/index';
import { config } from '@config/config';
import { BookingFactory } from '@factories/index';

test.describe('Restful-Booker · Booking extended @api @regression @booking', () => {
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

  test('@smoke the health ping reports the service is up', async ({ bookingApi }) => {
    const res = await bookingApi.health();
    expect(res.status).toBe(HttpStatus.CREATED); // Restful-Booker /ping → 201
  });

  test('listing booking ids returns a non-empty array', async ({ bookingApi }) => {
    const res = await bookingApi.getAllIds();
    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('a created booking echoes its payload and a new id', async ({ bookingApi }) => {
    const payload = BookingFactory.valid();
    const res = await bookingApi.create(payload);
    expect(res.body.bookingid).toBeTruthy();
    expect(res.body.booking.firstname).toBe(payload.firstname);
  });

  test('a created booking is retrievable by id', async ({ bookingApi }) => {
    const payload = BookingFactory.valid();
    const created = await bookingApi.create(payload);
    const fetched = await bookingApi.getById(created.body.bookingid);
    expect(fetched.status).toBe(HttpStatus.OK);
    expect(fetched.body.firstname).toBe(payload.firstname);
  });

  test('bookings can be filtered by first name', async ({ bookingApi }) => {
    const payload = BookingFactory.valid();
    const created = await bookingApi.create(payload);
    const filtered = await bookingApi.getAllIds({ firstname: payload.firstname });
    expect(filtered.body.some((b) => b.bookingid === created.body.bookingid)).toBe(true);
  });

  test('a partial update (PATCH) changes a single field', async ({ bookingApi, authApi }) => {
    const token = await authApi.getBookerToken();
    const created = await bookingApi.create(BookingFactory.valid());
    const res = await bookingApi.patch(created.body.bookingid, { firstname: 'Patched' }, token);
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.firstname).toBe('Patched');
  });
});
