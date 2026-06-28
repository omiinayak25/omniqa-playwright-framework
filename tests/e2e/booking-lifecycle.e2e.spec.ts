/**
 * --------------------------------------------------------
 * File: booking-lifecycle.e2e.spec.ts
 * Module: E2E Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Booking API full lifecycle (auth → create → read → update → patch → delete).
 * Business Scenario: A booking flows through its complete lifecycle, validated each step.
 * Preconditions: Network access to Restful-Booker; AuthAPI token retrievable.
 * Test Strategy: Serial, stateful E2E lifecycle combining AuthAPI + BookingAPI.
 * Expected Outcome: Each stage validates correctly; booking ends deleted (404).
 * Priority: High
 * Tags: @e2e @api
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Serial mode — each step depends on the previous.
 * --------------------------------------------------------
 *
 * E2E · API lifecycle (Restful-Booker).
 * A single booking flows through its entire lifecycle, validated at each step,
 * combining AuthAPI + BookingAPI. Serial: each step depends on the previous.
 * Tagged @e2e @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { CREATED_BOOKING_SCHEMA, BOOKING_SCHEMA } from '@schemas/booking.schema';
import type { Booking } from '@models/booking.model';

test.describe.configure({ mode: 'serial' });

test.describe('E2E · Booking lifecycle @e2e @api', () => {
  let token: string;
  let bookingId: number;

  const original: Booking = {
    firstname: 'Lifecycle',
    lastname: 'Tester',
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2026-08-01', checkout: '2026-08-05' },
    additionalneeds: 'Late checkout',
  };

  test('1 · authenticate', async ({ authApi }) => {
    token = await authApi.getBookerToken();
    expect(token).toBeTruthy();
  });

  test('2 · create the booking', async ({ bookingApi }) => {
    const res = await bookingApi.create(original);
    ResponseValidator.for(res).status(HttpStatus.OK).matchesSchema(CREATED_BOOKING_SCHEMA);
    bookingId = res.body.bookingid;
    expect(bookingId).toBeGreaterThan(0);
  });

  test('3 · read back & verify', async ({ bookingApi }) => {
    const res = await bookingApi.getById(bookingId);
    ResponseValidator.for(res).status(HttpStatus.OK).matchesSchema(BOOKING_SCHEMA);
    expect(res.body.firstname).toBe(original.firstname);
    expect(res.body.totalprice).toBe(original.totalprice);
  });

  test('4 · full update (PUT) & verify', async ({ bookingApi }) => {
    const updated: Booking = { ...original, firstname: 'Updated', totalprice: 999 };
    const res = await bookingApi.update(bookingId, updated, token);
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.firstname).toBe('Updated');
    expect(res.body.totalprice).toBe(999);
  });

  test('5 · partial update (PATCH) & verify', async ({ bookingApi }) => {
    const res = await bookingApi.patch(bookingId, { additionalneeds: 'Breakfast' }, token);
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.additionalneeds).toBe('Breakfast');
  });

  test('6 · delete & verify gone (404)', async ({ bookingApi }) => {
    const del = await bookingApi.remove(bookingId, token);
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(del.status);

    const refetch = await bookingApi.getById(bookingId);
    expect(refetch.status).toBe(HttpStatus.NOT_FOUND);
  });
});
