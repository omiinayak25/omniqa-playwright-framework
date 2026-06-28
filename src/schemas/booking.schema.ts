/**
 * --------------------------------------------------------
 * File: booking.schema.ts
 * Module: JSON Schemas
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * JSON Schema definitions for the Restful-Booker booking resource, used for
 * contract testing of API responses via AJV.
 *
 * Responsibilities:
 * - Define BOOKING_SCHEMA (shape of a booking record)
 * - Define CREATED_BOOKING_SCHEMA (POST /booking response envelope)
 *
 * Used By:
 * src/schemas/index.ts (re-export), ResponseValidator.matchesSchema(),
 * tests/api/* Restful-Booker contract specs
 *
 * Dependencies:
 * None (plain JSON schema literals; consumed by AJV via validateSchema)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Declared `as const` so the literal shapes stay readonly and type-narrowed.
 * --------------------------------------------------------
 */
export const BOOKING_SCHEMA = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      required: ['checkin', 'checkout'],
      properties: {
        checkin: { type: 'string' },
        checkout: { type: 'string' },
      },
    },
    additionalneeds: { type: 'string' },
  },
} as const;

export const CREATED_BOOKING_SCHEMA = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'integer' },
    booking: BOOKING_SCHEMA,
  },
} as const;
