/**
 * --------------------------------------------------------
 * File: booking.endpoints.ts
 * Module: API Endpoints
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Restful-Booker endpoint paths (auth token, health ping, booking CRUD),
 * relative to the Restful-Booker base URL. Single source of truth for these
 * routes — a vendor route change is a one-line edit here.
 *
 * Used By:
 * @services/booking.api, @services/auth.api (AUTH).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export const RESTFUL_BOOKER_ENDPOINTS = {
  AUTH: '/auth',
  PING: '/ping',
  BOOKING: '/booking',
  BOOKING_BY_ID: (id: number): string => `/booking/${id}`,
} as const;
