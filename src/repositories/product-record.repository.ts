/**
 * --------------------------------------------------------
 * File: product-record.repository.ts
 * Module: Repositories
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Data-access layer for the `products` table — the DB sink that persists
 * products synced from the API tier.
 *
 * Responsibilities:
 * - Idempotently upsert a product keyed on `external_id`.
 * - Look up and delete products by their external id.
 *
 * Used By:
 * E2E DB sync, tests/db/*, API-to-DB sync verification
 *
 * Dependencies:
 * @repositories/base.repository, @database/query-runner,
 * @models/product-record.model (ProductRecord, ProductSyncInput)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * UPSERT (ON CONFLICT) makes re-running the sync safe — repeated syncs update
 * in place rather than creating duplicate rows. All queries are parameterized.
 * --------------------------------------------------------
 */
import { BaseRepository } from '@repositories/base.repository';
import { QueryRunner } from '@database/query-runner';
import type { ProductRecord, ProductSyncInput } from '@models/product-record.model';

/**
 * Repository for the `products` table.
 *
 * Extends {@link BaseRepository}; inherits `count()` and the shared
 * {@link QueryRunner}.
 */
export class ProductRecordRepository extends BaseRepository {
  protected readonly table = 'products';

  constructor(runner: QueryRunner = new QueryRunner()) {
    super(runner);
  }

  /**
   * Insert or update a product, keyed on its unique `external_id`.
   *
   * Purpose: Idempotent sync — on conflict the existing row is updated
   * (title/price/category refreshed, `synced_at` bumped to NOW()) instead of
   * inserting a duplicate, so re-running the sync is safe.
   *
   * @param input Product payload from the API tier; `category` defaults to
   *              `null` when absent.
   * @returns The inserted-or-updated {@link ProductRecord} (via RETURNING *).
   * @throws {Error} If the statement does not yield exactly one row.
   */
  public async upsert(input: ProductSyncInput): Promise<ProductRecord> {
    return this.runner.one<ProductRecord>(
      `INSERT INTO products (external_id, title, price, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (external_id)
       DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price,
                     category = EXCLUDED.category, synced_at = NOW()
       RETURNING *`,
      [input.externalId, input.title, input.price, input.category ?? null],
    );
  }

  /**
   * Look up a synced product by its source/external id.
   *
   * @param externalId External id from the API tier.
   * @returns The matching {@link ProductRecord}, or `null` if not synced.
   */
  public async findByExternalId(externalId: number): Promise<ProductRecord | null> {
    return this.runner.maybeOne<ProductRecord>('SELECT * FROM products WHERE external_id = $1', [
      externalId,
    ]);
  }

  /**
   * Delete a synced product by its external id (test cleanup).
   *
   * @param externalId External id of the product to remove.
   * @returns Number of rows deleted (0 if none matched).
   */
  public async deleteByExternalId(externalId: number): Promise<number> {
    return this.runner.none('DELETE FROM products WHERE external_id = $1', [externalId]);
  }
}
