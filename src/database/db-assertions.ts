/**
 * --------------------------------------------------------
 * File: db-assertions.ts
 * Module: Database Access
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Reusable, intention-revealing database assertions that throw descriptive
 * errors, keeping verification SQL out of individual test bodies.
 *
 * Responsibilities:
 * - Assert exact row counts for a table/WHERE clause.
 * - Assert that a matching row does / does not exist.
 *
 * Used By:
 * tests/db/*, E2E DB sync verification
 *
 * Dependencies:
 * @database/query-runner (QueryRunner)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Filter values are always passed as bound params (injection-safe). The
 * `table`/`where` fragments are caller-supplied and must be trusted/static.
 * --------------------------------------------------------
 */
import { QueryRunner } from '@database/query-runner';

/**
 * Collection of database verification helpers.
 *
 * Each method runs a parameterized query and throws a human-readable Error on
 * mismatch, so failures read clearly in test output. Construct with a custom
 * {@link QueryRunner} to target a specific pool/transaction; defaults to the
 * shared runner.
 */
export class DbAssertions {
  constructor(private readonly runner: QueryRunner = new QueryRunner()) {}

  /**
   * Assert that the number of rows matching a filter equals an expected value.
   *
   * @param table    Table name to count rows in (caller-trusted fragment).
   * @param where    SQL WHERE condition using `$n` placeholders.
   * @param params   Values bound to the placeholders (injection-safe).
   * @param expected Exact row count expected.
   * @returns Resolves when the count matches.
   * @throws {Error} If the actual count differs from `expected`.
   */
  public async assertRowCount(
    table: string,
    where: string,
    params: ReadonlyArray<unknown>,
    expected: number,
  ): Promise<void> {
    const rows = await this.runner.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${where}`,
      params,
    );
    const actual = Number(rows[0]?.count ?? 0);
    if (actual !== expected) {
      throw new Error(`Expected ${expected} row(s) in ${table} where ${where}, found ${actual}`);
    }
  }

  /**
   * Assert that at least one row matches the filter.
   *
   * @param table  Table name to check (caller-trusted fragment).
   * @param where  SQL WHERE condition using `$n` placeholders.
   * @param params Values bound to the placeholders (injection-safe).
   * @returns Resolves when a matching row exists.
   * @throws {Error} If no matching row is found.
   */
  public async assertExists(
    table: string,
    where: string,
    params: ReadonlyArray<unknown>,
  ): Promise<void> {
    const rows = await this.runner.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${where}) AS exists`,
      params,
    );
    if (rows[0]?.exists !== true) {
      throw new Error(`Expected a row in ${table} where ${where}, found none`);
    }
  }

  /**
   * Assert that NO row matches the filter (e.g. to confirm a delete).
   *
   * @param table  Table name to check (caller-trusted fragment).
   * @param where  SQL WHERE condition using `$n` placeholders.
   * @param params Values bound to the placeholders (injection-safe).
   * @returns Resolves when no matching row exists.
   * @throws {Error} If a matching row unexpectedly exists.
   */
  public async assertNotExists(
    table: string,
    where: string,
    params: ReadonlyArray<unknown>,
  ): Promise<void> {
    const rows = await this.runner.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${where}) AS exists`,
      params,
    );
    if (rows[0]?.exists !== false) {
      throw new Error(`Expected NO row in ${table} where ${where}, but one exists`);
    }
  }
}
