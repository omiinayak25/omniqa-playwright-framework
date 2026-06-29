/**
 * --------------------------------------------------------
 * File: http.constants.ts
 * Module: Constants
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * HTTP status codes, methods, common header names, and content types used
 * across the API layer and assertions.
 *
 * Responsibilities:
 * - Provide named HTTP enums/consts so tests reference symbols, not literals.
 *
 * Used By:
 * API services/clients and API tests/assertions.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Centralized to remove magic numbers/strings like `expect(res).toBe(200)`
 * and to keep header/content-type spelling consistent everywhere.
 * --------------------------------------------------------
 */

/** Named HTTP response status codes used in request assertions. */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/** Supported HTTP verbs used when issuing requests. */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/** Canonical HTTP header names, centralized to avoid typos/casing drift. */
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  AUTHORIZATION: 'Authorization',
  COOKIE: 'Cookie',
  API_KEY: 'x-api-key',
  CORRELATION_ID: 'x-correlation-id',
} as const;

/** Common MIME / Content-Type values for request and response bodies. */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  XML: 'application/xml',
} as const;
