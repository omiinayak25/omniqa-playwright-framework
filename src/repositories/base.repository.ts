/**
 * --------------------------------------------------------
 * File: base.repository.ts
 * Module: Repositories
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Abstract base for the Repository pattern — holds the shared QueryRunner and
 * common table operations so concrete repos stay focused on domain queries.
 *
 * Responsibilities:
 * - Provide the protected QueryRunner used by all subclasses.
 * - Require subclasses to declare their `table` name.
 * - Offer a generic `count()` over the subclass's table.
 *
 * Used By:
 * EmployeeRepository, DepartmentRepository, ProductRecordRepository
 *
 * Dependencies:
 * @database/query-runner (QueryRunner)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Repository pattern keeps SQL out of tests/services; subclasses expose
 * intention-revealing methods (findByEmail, insert, deactivate …).
 * --------------------------------------------------------
 */
import { QueryRunner } from '@database/query-runner';

/**
 * Shared base class for all table repositories.
 *
 * Abstract: cannot be instantiated directly. Each concrete repository extends
 * it, sets `table`, and adds its own domain methods on top of the inherited
 * {@link QueryRunner} and {@link BaseRepository.count}.
 */
export abstract class BaseRepository {
  protected readonly runner: QueryRunner;
  /** Concrete repos declare their table name. */
  protected abstract readonly table: string;

  protected constructor(runner: QueryRunner = new QueryRunner()) {
    this.runner = runner;
  }

  /**
   * Count all rows in this repository's table.
   *
   * @returns Total number of rows currently in `this.table`.
   * @throws Propagates any driver/SQL error from the underlying query.
   */
  public async count(): Promise<number> {
    const rows = await this.runner.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM ${this.table}`,
    );
    return Number(rows[0]?.count ?? 0);
  }
}
