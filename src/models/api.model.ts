/**
 * --------------------------------------------------------
 * File: api.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Core, service-agnostic API types (normalized response + request options)
 * shared by the API client, services, and tests.
 *
 * Responsibilities:
 * - Define the normalized ApiResponse<T> wrapper returned by every call.
 * - Define per-request RequestOptions accepted by the client.
 *
 * Used By:
 * API client, API services, repositories, and API tests.
 *
 * Dependencies:
 * @playwright/test (APIResponse type, for raw low-level access).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * --------------------------------------------------------
 */
import type { APIResponse } from '@playwright/test';

/** Normalized response returned by every ApiClient method. */
export interface ApiResponse<T> {
  readonly status: number;
  readonly ok: boolean;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: T;
  /** Wall-clock time for the request (ms) — used for perf assertions. */
  readonly responseTimeMs: number;
  /** Raw Playwright response (cookies, low-level access) when needed. */
  readonly raw: APIResponse;
}

/** Per-request options. All optional; the client fills sane defaults. */
export interface RequestOptions {
  readonly headers?: Record<string, string>;
  /** Query string parameters (appended to the URL, value-encoded). */
  readonly params?: Record<string, string | number | boolean>;
  /** Request body. Objects are JSON-serialized automatically. */
  readonly data?: unknown;
  /** Bearer token — added as `Authorization: Bearer <token>`. */
  readonly token?: string;
  /** Override Content-Type (defaults to application/json). */
  readonly contentType?: string;
  /** Extra retry attempts on transient (network / 5xx) failures. Default 2. */
  readonly retries?: number;
}
