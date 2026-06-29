/**
 * --------------------------------------------------------
 * File: booking.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Restful-Booker Booking API (CRUD + token auth).
 * Business Scenario: Bookings can be created, fetched, updated, and deleted with auth.
 * Preconditions: Network access to Restful-Booker; AuthAPI token retrievable.
 * Test Strategy: CRUD lifecycle, schema + perf validation, request chaining, negative.
 * Expected Outcome: Each operation returns the expected status and persisted values.
 * Priority: High
 * Tags: @api @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Restful-Booker API tests — full CRUD, auth, schema validation, request
 * chaining, and a negative case. All via the BookingAPI/AuthAPI services
 * (no raw request.* calls). Tagged @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { CREATED_BOOKING_SCHEMA, BOOKING_SCHEMA } from '@schemas/booking.schema';
import type { Booking } from '@models/booking.model';

function buildBooking(data: { firstName: string; lastName: string }): Booking {
  return {
    firstname: data.firstName,
    lastname: data.lastName,
    totalprice: 555,
    depositpaid: true,
    bookingdates: { checkin: '2026-07-01', checkout: '2026-07-10' },
    additionalneeds: 'Breakfast',
  };
}

test.describe('Restful-Booker · Booking API @api', () => {
  test('@smoke health check responds', async ({ bookingApi }) => {
    const res = await bookingApi.health();
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(res.status);
  });

  test('@smoke create → get → schema + perf (request chaining)', async ({ bookingApi, data }) => {
    const created = await bookingApi.create(
      buildBooking({ firstName: data.firstName(), lastName: data.lastName() }),
    );
    ResponseValidator.for(created).status(HttpStatus.OK).matchesSchema(CREATED_BOOKING_SCHEMA);

    const id = created.body.bookingid;
    expect(id).toBeGreaterThan(0);

    // chain: use the id returned by create to fetch the resource
    const fetched = await bookingApi.getById(id);
    ResponseValidator.for(fetched)
      .status(HttpStatus.OK)
      .maxTime(5000)
      .matchesSchema(BOOKING_SCHEMA);
    expect(fetched.body.firstname).toBe(created.body.booking.firstname);
  });

  test('update requires auth token then reflects changes (PUT)', async ({
    authApi,
    bookingApi,
    data,
  }) => {
    const token = await authApi.getBookerToken();
    expect(token).toBeTruthy();

    const created = await bookingApi.create(
      buildBooking({ firstName: data.firstName(), lastName: data.lastName() }),
    );
    const id = created.body.bookingid;

    const updated = await bookingApi.update(
      id,
      buildBooking({ firstName: 'Updated', lastName: 'Name' }),
      token,
    );
    ResponseValidator.for(updated).status(HttpStatus.OK);
    expect(updated.body.firstname).toBe('Updated');
  });

  test('delete removes the booking (DELETE → 404 on re-fetch)', async ({
    authApi,
    bookingApi,
    data,
  }) => {
    const token = await authApi.getBookerToken();
    const created = await bookingApi.create(
      buildBooking({ firstName: data.firstName(), lastName: data.lastName() }),
    );
    const id = created.body.bookingid;

    const del = await bookingApi.remove(id, token);
    expect([HttpStatus.CREATED, HttpStatus.OK]).toContain(del.status);

    const refetch = await bookingApi.getById(id);
    expect(refetch.status).toBe(HttpStatus.NOT_FOUND);
  });

  test('negative: get non-existent booking returns 404', async ({ bookingApi }) => {
    const res = await bookingApi.getById(99_999_999);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
