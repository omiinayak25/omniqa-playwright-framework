/**
 * --------------------------------------------------------
 * File: query-runner.ts
 * Module: Database Access
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Thin typed wrapper over the pg Pool that executes parameterized queries and
 * provides cardinality helpers plus a transaction wrapper.
 *
 * Responsibilities:
 * - Execute SQL with bound params and return typed rows (timing logged).
 * - Offer intention-revealing helpers: one / maybeOne / none.
 * - Run work inside a transaction with automatic COMMIT/ROLLBACK + release.
 *
 * Used By:
 * Repositories (base/employee/department/product-record), DbAssertions,
 * tests/db/*
 *
 * Dependencies:
 * pg Pool/PoolClient/QueryResultRow, @database/db-pool (getPool),
 * @utils/logger
 *
 * Last Updated: 2026-06-27
 * Notes:
 * ALWAYS uses parameterized queries ($1, $2 …) — never string interpolation
 * of values — so user/data input cannot alter SQL structure (injection-safe).
 * --------------------------------------------------------
 */
import type { Pool, PoolClient, QueryResultRow } from 'pg';
import { getPool } from '@database/db-pool';
import { scopedLogger } from '@utils/logger';

/**
 * Executes SQL against a pg {@link Pool} with type-safe results.
 *
 * Values are always supplied as bound parameters ($1, $2 …); the driver sends
 * them separately from the SQL text, so they are escaped by the database and
 * cannot be interpreted as SQL (no string interpolation of values anywhere).
 * Construct with a custom pool for isolation; defaults to the shared Singleton.
 */
export class QueryRunner {
  private readonly pool: Pool;
  private readonly log = scopedLogger('QueryRunner');

  constructor(pool: Pool = getPool()) {
    this.pool = pool;
  }

  /**
   * Run a SQL statement and return every matching row.
   *
   * @typeParam T  Shape of each returned row.
   * @param sql    SQL text using `$n` placeholders for all values.
   * @param params Values bound to the placeholders, in order (injection-safe).
   * @returns Array of typed rows (empty if none matched).
   * @throws Propagates any driver/SQL error from pg.
   * @example
   * const rows = await runner.query<Employee>(
   *   'SELECT * FROM employees WHERE department_id = $1', [deptId]);
   */
  public async query<T extends QueryResultRow>(
    sql: string,
    params: ReadonlyArray<unknown> = [],
  ): Promise<T[]> {
    const start = Date.now();
    const result = await this.pool.query<T>(sql, params as unknown[]);
    this.log.debug(`SQL (${Date.now() - start}ms): ${sql.replace(/\s+/g, ' ').trim()}`, {
      rows: result.rowCount,
    });
    return result.rows;
  }

  /**
   * Run a statement that must return exactly one row.
   *
   * @typeParam T  Shape of the returned row.
   * @param sql    SQL text using `$n` placeholders.
   * @param params Values bound to the placeholders (injection-safe).
   * @returns The single typed row.
   * @throws {Error} If zero or more than one row is returned.
   */
  public async one<T extends QueryResultRow>(
    sql: string,
    params: ReadonlyArray<unknown> = [],
  ): Promise<T> {
    const rows = await this.query<T>(sql, params);
    if (rows.length !== 1) {
      throw new Error(`Expected exactly 1 row but got ${rows.length} for: ${sql}`);
    }
    return rows[0] as T;
  }

  /**
   * Run a statement that returns at most one row.
   *
   * @typeParam T  Shape of the returned row.
   * @param sql    SQL text using `$n` placeholders.
   * @param params Values bound to the placeholders (injection-safe).
   * @returns The single typed row, or `null` if none matched.
   * @throws {Error} If more than one row is returned.
   */
  public async maybeOne<T extends QueryResultRow>(
    sql: string,
    params: ReadonlyArray<unknown> = [],
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    if (rows.length > 1) throw new Error(`Expected at most 1 row but got ${rows.length}`);
    return rows[0] ?? null;
  }

  /**
   * Run a write statement (INSERT/UPDATE/DELETE) expecting no result rows.
   *
   * @param sql    SQL text using `$n` placeholders.
   * @param params Values bound to the placeholders (injection-safe).
   * @returns Number of rows affected (0 if the driver reports none).
   * @throws Propagates any driver/SQL error from pg.
   */
  public async none(sql: string, params: ReadonlyArray<unknown> = []): Promise<number> {
    const result = await this.pool.query(sql, params as unknown[]);
    return result.rowCount ?? 0;
  }

  /**
   * Run `work` atomically inside a single database transaction.
   *
   * Purpose: Group multiple statements so they all succeed or all fail. A
   * dedicated client is checked out of the pool and `BEGIN` is issued. If
   * `work` resolves, the changes are COMMITted; if it throws, they are
   * ROLLed BACK so no partial state is persisted. The client is always
   * released back to the pool in `finally` (success or failure) so it is not
   * leaked from the pool.
   *
   * @typeParam T  Value produced by `work` and forwarded on commit.
   * @param work   Callback receiving the transaction-bound {@link PoolClient};
   *               run all transactional statements through this client.
   * @returns Whatever `work` resolves to (after a successful COMMIT).
   * @throws Re-throws any error from `work` (after performing the ROLLBACK).
   * @example
   * await runner.transaction(async (client) => {
   *   await client.query('INSERT INTO a ...');
   *   await client.query('UPDATE b ...'); // both commit, or both roll back
   * });
   */
  public async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    // A transaction must run on one dedicated client, not the pool round-robin.
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error: unknown) {
      // Any failure undoes the whole unit of work — never leave partial state.
      await client.query('ROLLBACK');
      this.log.warn('Transaction rolled back');
      throw error;
    } finally {
      // Always return the client to the pool so it is not leaked.
      client.release();
    }
  }
}
