/**
 * --------------------------------------------------------
 * File: product-record.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Persisted product record and sync-input models for the API->DB sync flow.
 *
 * Responsibilities:
 * - Type the stored `products` row and the upsert input from the source API.
 *
 * Used By:
 * Product-sync repository and the API->DB sync tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * `ProductRecord` mirrors the `products` table (snake_case); `external_id`
 * is the source-system id.
 * --------------------------------------------------------
 */

/** A persisted product row (DB sink) keyed locally by id, externally by external_id. */
export interface ProductRecord {
  readonly id: number;
  readonly external_id: number;
  readonly title: string;
  readonly price: number;
  readonly category: string | null;
  readonly synced_at: Date;
}

/** Input for syncing a source product into the DB (camelCase, category optional). */
export interface ProductSyncInput {
  readonly externalId: number;
  readonly title: string;
  readonly price: number;
  readonly category?: string;
}
