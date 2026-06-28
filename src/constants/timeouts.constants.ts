/**
 * --------------------------------------------------------
 * File: timeouts.constants.ts
 * Module: Constants
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Named timeout constants (milliseconds) for waits, polls, API calls, and
 * page loads.
 *
 * Responsibilities:
 * - Provide a consistent, descriptive set of timeout values.
 *
 * Used By:
 * Page objects, API clients, DB helpers, and tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Centralized to eliminate magic numbers in waits/polls; `as const` narrows
 * to literal types for safer usage.
 * --------------------------------------------------------
 */

/** Standard millisecond timeout presets keyed by intent (INSTANT..PAGE_LOAD). */
export const TIMEOUTS = {
  INSTANT: 1_000,
  SHORT: 5_000,
  MEDIUM: 15_000,
  LONG: 30_000,
  EXTRA_LONG: 60_000,
  API_DEFAULT: 30_000,
  DB_QUERY: 10_000,
  PAGE_LOAD: 45_000,
} as const;

/** Union of valid TIMEOUTS keys — type-safe references to a named preset. */
export type TimeoutKey = keyof typeof TIMEOUTS;
