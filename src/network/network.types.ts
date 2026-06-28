/**
 * --------------------------------------------------------
 * File: network.types.ts
 * Module: Network
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Type contracts for the network layer — route-mock specs and the captured
 * traffic record shape. One typed surface so specs express network intent
 * without touching Playwright's raw Route/Request objects.
 *
 * Responsibilities:
 * - Define MockResponse (what to fulfil a route with).
 * - Define NetworkRecord (one captured request/response for analytics).
 *
 * Used By:
 * network-manager.ts, tests/network/** specs.
 *
 * Dependencies:
 * None (pure types).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */

/** A URL matcher: a glob string or a RegExp (Playwright route semantics). */
export type UrlPattern = string | RegExp;

/** How to fulfil an intercepted route. */
export interface MockResponse {
  /** HTTP status code (default 200). */
  readonly status?: number;
  /** Response body — object (serialised to JSON) or raw string. */
  readonly body?: unknown;
  /** Content-Type (defaults to application/json when body is an object). */
  readonly contentType?: string;
  /** Extra response headers (CORS headers are added automatically). */
  readonly headers?: Readonly<Record<string, string>>;
}

/** One captured request/response pair (for traffic analytics / assertions). */
export interface NetworkRecord {
  /** Request URL. */
  readonly url: string;
  /** HTTP method. */
  readonly method: string;
  /** Response status (-1 if the request failed before a response). */
  readonly status: number;
  /** Resource type (xhr, fetch, document, image…). */
  readonly resourceType: string;
  /** Whether this route was served from a mock. */
  readonly mocked: boolean;
}
