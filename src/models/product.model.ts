/**
 * --------------------------------------------------------
 * File: product.model.ts
 * Module: Domain Models
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Generic product domain model used by SauceDemo UI tests and product APIs.
 *
 * Responsibilities:
 * - Type a simple product (name, optional description, price).
 *
 * Used By:
 * SauceDemo UI tests and product-related services/tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * --------------------------------------------------------
 */

/** A storefront product: display name, optional description, and price. */
export interface Product {
  readonly name: string;
  readonly description?: string;
  readonly price: number;
}
