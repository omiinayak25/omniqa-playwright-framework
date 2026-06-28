/**
 * --------------------------------------------------------
 * File: booking.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Restful-Booker API BDD steps (Cucumber → ApiClient + services).
 * Business Scenario: Gherkin booking scenarios drive the same API client/services as specs.
 * Preconditions: CustomWorld with an API context; network access to Restful-Booker.
 * Test Strategy: BDD step glue using Data Tables & Doc Strings, reusing API services.
 * Expected Outcome: Steps create/read/delete bookings and assert expected outcomes.
 * Priority: Medium
 * Tags: (driven by features/booking-api.feature — @api @booking @smoke @regression)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Restful-Booker API step definitions — reuse the SAME ApiClient + services
 * as the Playwright-Test API specs. Demonstrates Data Tables & Doc Strings.
 */
import { Given, When, Then, type DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ApiClient } from '@api/clients/api-client';
import { AuthAPI } from '@services/auth.api';
import { BookingAPI } from '@services/booking.api';
import { config } from '@config/config';
import type { Booking } from '@models/booking.model';
import type { CustomWorld } from '@bdd/world';

function bookingApiFor(world: CustomWorld): BookingAPI {
  return new BookingAPI(new ApiClient(world.apiContext, config.api.restfulBooker.baseUrl));
}

Given('I have a valid Booker auth token', async function (this: CustomWorld) {
  const booker = new ApiClient(this.apiContext, config.api.restfulBooker.baseUrl);
  const dummy = new ApiClient(this.apiContext, config.api.dummyJson.baseUrl);
  const token = await new AuthAPI(booker, dummy).getBookerToken();
  expect(token).toBeTruthy();
  this.set('token', token);
});

When(
  'I create a booking with the following details:',
  async function (this: CustomWorld, table: DataTable) {
    const d = table.rowsHash();
    const booking: Booking = {
      firstname: d['firstname'] ?? '',
      lastname: d['lastname'] ?? '',
      totalprice: Number(d['totalprice'] ?? 0),
      depositpaid: d['depositpaid'] === 'true',
      bookingdates: { checkin: d['checkin'] ?? '', checkout: d['checkout'] ?? '' },
    };
    const res = await bookingApiFor(this).create(booking);
    this.set('createResponse', res);
    this.set('bookingId', res.body.bookingid);
  },
);

When(
  'I create a booking for {string} {string} with additional needs:',
  async function (this: CustomWorld, firstname: string, lastname: string, docString: string) {
    const booking: Booking = {
      firstname,
      lastname,
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: '2026-09-01', checkout: '2026-09-03' },
      additionalneeds: docString.trim(),
    };
    const res = await bookingApiFor(this).create(booking);
    this.set('createResponse', res);
    this.set('bookingId', res.body.bookingid);
    this.set('additionalneeds', booking.additionalneeds);
  },
);

Given(
  'a booking exists for {string} {string}',
  async function (this: CustomWorld, fn: string, ln: string) {
    const res = await bookingApiFor(this).create({
      firstname: fn,
      lastname: ln,
      totalprice: 100,
      depositpaid: false,
      bookingdates: { checkin: '2026-09-01', checkout: '2026-09-02' },
    });
    this.set('bookingId', res.body.bookingid);
  },
);

When('I delete that booking', async function (this: CustomWorld) {
  const id = this.get<number>('bookingId');
  const token = this.get<string>('token');
  const res = await bookingApiFor(this).remove(id, token);
  expect([200, 201]).toContain(res.status);
});

Then('the booking should be created successfully', function (this: CustomWorld) {
  const res = this.get<{ status: number }>('createResponse');
  expect(res.status).toBe(200);
});

Then(
  'the stored booking firstname should be {string}',
  async function (this: CustomWorld, expected: string) {
    const id = this.get<number>('bookingId');
    const res = await bookingApiFor(this).getById(id);
    expect(res.body.firstname).toBe(expected);
  },
);

Then(
  'the stored booking should include those additional needs',
  async function (this: CustomWorld) {
    const id = this.get<number>('bookingId');
    const expected = this.get<string>('additionalneeds');
    const res = await bookingApiFor(this).getById(id);
    expect(res.body.additionalneeds).toBe(expected);
  },
);

Then('the booking should no longer be retrievable', async function (this: CustomWorld) {
  const id = this.get<number>('bookingId');
  const res = await bookingApiFor(this).getById(id);
  expect(res.status).toBe(404);
});
