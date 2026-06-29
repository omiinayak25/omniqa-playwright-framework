/**
 * --------------------------------------------------------
 * File: e2e.steps.ts
 * Module: Step Definitions
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Cross-layer E2E BDD steps (API→DB sync; booking lifecycle).
 * Business Scenario: Scenarios span multiple layers in one flow, carrying state
 *                    (api product, booking id) across steps via the World bag.
 * Preconditions: Network (DummyJSON / Restful-Booker) + embedded PGlite.
 * Test Strategy: BDD glue reusing ProductAPI, BookingAPI and the repositories.
 * Priority: High
 * Tags: (driven by features/e2e/*.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * REUSED steps: "the automation database is reachable" (database.steps.ts) and
 * "I have a valid Booker auth token" (booking.steps.ts). `this` is the World.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { productApi, bookingApi } from './support/api.support';
import { ProductRecordRepository } from '@repositories/product-record.repository';
import type { CustomWorld } from '@bdd/world';

// ===================== API → DB product sync =====================
interface ApiProduct {
  id: number;
  title: string;
  price: number;
  category: string;
}

When('I fetch product {int} from the API', async function (this: CustomWorld, id: number) {
  const res = await productApi(this).getById(id);
  expect(res.status).toBe(200);
  this.set('apiProduct', res.body as ApiProduct);
});

When('I sync that product into the database', async function (this: CustomWorld) {
  const p = this.get<ApiProduct>('apiProduct');
  await new ProductRecordRepository().upsert({
    externalId: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
  });
});

When(
  'I sync that product again with the price increased by 10',
  async function (this: CustomWorld) {
    const p = this.get<ApiProduct>('apiProduct');
    const newPrice = p.price + 10;
    this.set('latestPrice', newPrice);
    await new ProductRecordRepository().upsert({
      externalId: p.id,
      title: p.title,
      price: newPrice,
      category: p.category,
    });
  },
);

Then('the stored product should match the API product', async function (this: CustomWorld) {
  const p = this.get<ApiProduct>('apiProduct');
  const record = await new ProductRecordRepository().findByExternalId(p.id);
  expect(record).not.toBeNull();
  expect(record?.title).toBe(p.title);
  expect(Number(record?.price)).toBeCloseTo(p.price, 2);
  expect(record?.category).toBe(p.category);
});

Then('the stored product price should reflect the latest sync', async function (this: CustomWorld) {
  const p = this.get<ApiProduct>('apiProduct');
  const record = await new ProductRecordRepository().findByExternalId(p.id);
  expect(Number(record?.price)).toBeCloseTo(this.get<number>('latestPrice'), 2);
});

// ===================== Booking lifecycle =====================
// Reuses the "I have a valid Booker auth token" Given which stores 'token'.

When(
  'I create a booking for {string} {string} priced at {int}',
  async function (this: CustomWorld, first: string, last: string, price: number) {
    const res = await bookingApi(this).create({
      firstname: first,
      lastname: last,
      totalprice: price,
      depositpaid: true,
      bookingdates: { checkin: '2026-09-01', checkout: '2026-09-05' },
    });
    expect(res.status).toBe(200);
    this.set('bookingId', res.body.bookingid);
    this.set('bookingLast', last);
  },
);

Then(
  'the booking should be retrievable with first name {string}',
  async function (this: CustomWorld, first: string) {
    const res = await bookingApi(this).getById(this.get<number>('bookingId'));
    expect(res.status).toBe(200);
    expect(res.body.firstname).toBe(first);
  },
);

When(
  'I update the booking first name to {string} and price to {int}',
  async function (this: CustomWorld, first: string, price: number) {
    const res = await bookingApi(this).update(
      this.get<number>('bookingId'),
      {
        firstname: first,
        lastname: this.get<string>('bookingLast'),
        totalprice: price,
        depositpaid: true,
        bookingdates: { checkin: '2026-09-01', checkout: '2026-09-05' },
      },
      this.get<string>('token'),
    );
    expect([200, 201]).toContain(res.status);
  },
);

When('I delete the booking', async function (this: CustomWorld) {
  const res = await bookingApi(this).remove(
    this.get<number>('bookingId'),
    this.get<string>('token'),
  );
  expect([200, 201]).toContain(res.status);
});

Then('the booking should no longer exist', async function (this: CustomWorld) {
  const res = await bookingApi(this).getById(this.get<number>('bookingId'));
  expect(res.status).toBe(404);
});
