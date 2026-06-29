/**
 * --------------------------------------------------------
 * File: booking.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Business service exposing full CRUD over the Restful-Booker /booking
 * resource plus a health ping. Encapsulates Restful-Booker's cookie-based
 * auth so test code never deals with header plumbing.
 *
 * Responsibilities:
 * - Health check (GET /ping)
 * - List booking ids (with optional filter params)
 * - Get a booking by id
 * - Create / full-update / partial-update / delete bookings
 *
 * Used By:
 * api.fixtures.ts, tests/api/* (Restful-Booker CRUD + contract specs)
 *
 * Dependencies:
 * ApiClient, RESTFUL_BOOKER_ENDPOINTS, HEADERS constants,
 * ApiResponse, Booking/BookingId/CreatedBooking models
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Write operations (PUT/PATCH/DELETE) require auth; Restful-Booker takes the
 * token as a `Cookie: token=<token>` header, supplied per-request here.
 * --------------------------------------------------------
 */
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the Restful-Booker endpoint path builders.
import { RESTFUL_BOOKER_ENDPOINTS } from '@api/endpoints';
// Import the HTTP header-name constants (for the auth cookie).
import { HEADERS } from '@constants/http.constants';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the booking domain models (type-only).
import type { Booking, BookingId, CreatedBooking } from '@models/booking.model';

/**
 * BookingAPI
 *
 * Business-layer service for the Restful-Booker booking resource. Maps each
 * domain operation to an HTTP call on the injected ApiClient and owns the
 * auth-cookie detail for writes. SRP: domain semantics live here; transport,
 * retry, and logging stay in ApiClient.
 */
// Declare the Restful-Booker booking service.
export class BookingAPI {
  /** @param client ApiClient bound to the Restful-Booker base URL. */
  // Inject the ApiClient (bound to the Restful-Booker base URL).
  constructor(private readonly client: ApiClient) {}

  /**
   * Health check.
   * @returns GET /ping response (204 when the service is up).
   */
  // Health check (GET /ping).
  public async health(): Promise<ApiResponse<string>> {
    // GET the ping endpoint.
    return this.client.get<string>(RESTFUL_BOOKER_ENDPOINTS.PING);
  }

  /**
   * List all booking ids, optionally filtered.
   * @param filter Optional query params (e.g. firstname, checkin) sent verbatim.
   * @returns GET /booking response with the array of booking ids.
   */
  // List booking ids, optionally filtered (GET /booking?...).
  public async getAllIds(
    filter?: Record<string, string | number>,
  ): Promise<ApiResponse<BookingId[]>> {
    // GET the booking collection, forwarding any filter as query params.
    return this.client.get<BookingId[]>(RESTFUL_BOOKER_ENDPOINTS.BOOKING, { params: filter });
  }

  /**
   * Fetch a single booking.
   * @param id Booking id.
   * @returns GET /booking/:id response with the full booking.
   */
  // Fetch a single booking (GET /booking/:id).
  public async getById(id: number): Promise<ApiResponse<Booking>> {
    // GET the id-scoped booking endpoint.
    return this.client.get<Booking>(RESTFUL_BOOKER_ENDPOINTS.BOOKING_BY_ID(id));
  }

  /**
   * Create a booking.
   * @param booking Booking payload.
   * @returns POST /booking response with the new id wrapped in CreatedBooking.
   */
  // Create a booking (POST /booking).
  public async create(booking: Booking): Promise<ApiResponse<CreatedBooking>> {
    // POST the booking payload; response wraps the new id.
    return this.client.post<CreatedBooking>(RESTFUL_BOOKER_ENDPOINTS.BOOKING, { data: booking });
  }

  /**
   * Fully replace a booking (auth required).
   * @param id Booking id.
   * @param booking Complete booking payload.
   * @param token Restful-Booker auth token, sent as a `Cookie: token=<token>`.
   * @returns PUT /booking/:id response with the updated booking.
   */
  // Fully replace a booking (PUT /booking/:id; auth required).
  public async update(id: number, booking: Booking, token: string): Promise<ApiResponse<Booking>> {
    // PUT the full payload, carrying the auth cookie.
    return this.client.put<Booking>(RESTFUL_BOOKER_ENDPOINTS.BOOKING_BY_ID(id), {
      // Complete booking body.
      data: booking,
      // Restful-Booker authenticates writes via a token cookie, not Bearer.
      headers: { [HEADERS.COOKIE]: `token=${token}` },
    });
  }

  /**
   * Partially update a booking (auth required).
   * @param id Booking id.
   * @param partial Subset of booking fields to update.
   * @param token Restful-Booker auth token, sent as a `Cookie: token=<token>`.
   * @returns PATCH /booking/:id response with the updated booking.
   */
  // Partially update a booking (PATCH /booking/:id; auth required).
  public async patch(
    id: number,
    partial: Partial<Booking>,
    token: string,
  ): Promise<ApiResponse<Booking>> {
    // PATCH the subset of fields, carrying the auth cookie.
    return this.client.patch<Booking>(RESTFUL_BOOKER_ENDPOINTS.BOOKING_BY_ID(id), {
      // Partial booking body.
      data: partial,
      // Cookie-based auth, as above.
      headers: { [HEADERS.COOKIE]: `token=${token}` },
    });
  }

  /**
   * Delete a booking (auth required).
   * @param id Booking id.
   * @param token Restful-Booker auth token, sent as a `Cookie: token=<token>`.
   * @returns DELETE /booking/:id response.
   */
  // Delete a booking (DELETE /booking/:id; auth required).
  public async remove(id: number, token: string): Promise<ApiResponse<string>> {
    // DELETE the id-scoped endpoint, carrying the auth cookie.
    return this.client.delete<string>(RESTFUL_BOOKER_ENDPOINTS.BOOKING_BY_ID(id), {
      // Cookie-based auth, as above.
      headers: { [HEADERS.COOKIE]: `token=${token}` },
    });
  }
}
