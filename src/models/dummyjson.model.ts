/**
 * --------------------------------------------------------
 * File: dummyjson.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * DummyJSON domain models (product, paginated product list, new-product
 * payload, and auth response).
 *
 * Responsibilities:
 * - Type the request/response shapes of the DummyJSON API.
 *
 * Used By:
 * DummyJSON service and its API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * @see https://dummyjson.com/docs
 * --------------------------------------------------------
 */

/** A single DummyJSON product with pricing, category, stock, and rating. */
export interface DummyProduct {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly category: string;
  readonly stock: number;
  readonly rating: number;
}

/** Paginated product list wrapper (products plus total/skip/limit metadata). */
export interface ProductList {
  readonly products: DummyProduct[];
  readonly total: number;
  readonly skip: number;
  readonly limit: number;
}

/** Payload for creating a product (title required; price/category optional). */
export interface NewProduct {
  readonly title: string;
  readonly price?: number;
  readonly category?: string;
}

/** Response of POST /auth/login. */
export interface DummyAuthResponse {
  readonly id: number;
  readonly username: string;
  readonly accessToken: string;
  readonly refreshToken: string;
}
