/**
 * --------------------------------------------------------
 * File: negative-boundary.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Error/boundary handling across Booker, DummyJSON, Petstore.
 * Business Scenario: APIs must reject invalid input and handle edge limits safely.
 * Preconditions: Network access to the public APIs under test.
 * Test Strategy: Negative + boundary, data-driven (one body, many adversarial inputs).
 * Expected Outcome: Invalid ids yield 404; boundary limits respected; no-match is empty.
 * Priority: High
 * Tags: @api @negative
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Negative + boundary testing — data-driven matrices. One test body, many
 * adversarial inputs. Tagged @api @negative.
 */
import { test, expect } from '@fixtures/index';
import { HttpStatus } from '@constants/index';

// ---- Booking: invalid ids should never return 200 ----
const INVALID_BOOKING_IDS: ReadonlyArray<{ id: number; label: string }> = [
  { id: 0, label: 'zero' },
  { id: -1, label: 'negative' },
  { id: 99_999_999, label: 'far-out-of-range' },
];

test.describe('Negative · Restful-Booker @api @negative', () => {
  for (const { id, label } of INVALID_BOOKING_IDS) {
    test(`GET /booking/${label} → not found`, async ({ bookingApi }) => {
      const res = await bookingApi.getById(id);
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  }
});

// ---- DummyJSON product pagination boundaries ----
const PAGINATION_BOUNDARIES: ReadonlyArray<{ limit: number; expectMax: number; label: string }> = [
  { limit: 1, expectMax: 1, label: 'minimum limit' },
  { limit: 100, expectMax: 100, label: 'large limit' },
];

test.describe('Boundary · DummyJSON products @api @negative', () => {
  for (const { limit, expectMax, label } of PAGINATION_BOUNDARIES) {
    test(`limit=${limit} (${label}) returns at most ${expectMax}`, async ({ productApi }) => {
      const res = await productApi.list(limit, 0);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.products.length).toBeLessThanOrEqual(expectMax);
      expect(res.body.products.length).toBeGreaterThan(0);
    });
  }

  test('search with no match returns empty set, not an error', async ({ productApi }) => {
    const res = await productApi.search('zzzznotarealproductzzz');
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.products).toHaveLength(0);
  });
});

// ---- Petstore: malformed id ----
test.describe('Negative · Petstore @api @negative', () => {
  test('GET /pet/{nonexistent} → 404', async ({ petApi }) => {
    const res = await petApi.getById(123_456_789_012);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
