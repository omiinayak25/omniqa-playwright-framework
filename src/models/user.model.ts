/**
 * --------------------------------------------------------
 * File: user.model.ts
 * Module: Domain Models
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * User / authentication domain models shared across UI, API, and DB layers
 * (credentials, person name, checkout info).
 *
 * Responsibilities:
 * - Type the auth and identity shapes reused by multiple test layers.
 *
 * Used By:
 * UI page objects/tests (login, checkout), API auth, and DB flows.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * --------------------------------------------------------
 */

/** A username/password pair used to authenticate. */
export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

/** Minimal person identity used by UI forms (e.g. SauceDemo checkout). */
export interface PersonName {
  readonly firstName: string;
  readonly lastName: string;
}

/** Checkout/shipping information for the SauceDemo purchase flow. */
export interface CheckoutInfo extends PersonName {
  readonly postalCode: string;
}
