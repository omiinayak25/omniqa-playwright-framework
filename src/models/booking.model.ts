/**
 * --------------------------------------------------------
 * File: booking.model.ts
 * Module: Domain Models
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Restful-Booker domain models (booking payload, created-booking response,
 * id element, and auth token).
 *
 * Responsibilities:
 * - Type the request/response shapes of the Restful-Booker API.
 *
 * Used By:
 * Restful-Booker service and its API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * @see https://restful-booker.herokuapp.com/apidoc/index.html
 * --------------------------------------------------------
 */

/** Check-in / check-out date range for a booking (YYYY-MM-DD strings). */
export interface BookingDates {
  readonly checkin: string; // YYYY-MM-DD
  readonly checkout: string; // YYYY-MM-DD
}

/** A full booking record: guest, price, deposit flag, dates, optional needs. */
export interface Booking {
  readonly firstname: string;
  readonly lastname: string;
  readonly totalprice: number;
  readonly depositpaid: boolean;
  readonly bookingdates: BookingDates;
  readonly additionalneeds?: string;
}

/** Response of POST /booking. */
export interface CreatedBooking {
  readonly bookingid: number;
  readonly booking: Booking;
}

/** Element of GET /booking. */
export interface BookingId {
  readonly bookingid: number;
}

/** Response of POST /auth. */
export interface AuthToken {
  readonly token: string;
}
