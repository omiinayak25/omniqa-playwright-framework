/**
 * --------------------------------------------------------
 * File: department.repository.ts
 * Module: Repositories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Data-access layer for the `departments` table — the parent side of the
 * employee foreign-key relationship.
 *
 * Responsibilities:
 * - Find a department by its unique name.
 * - Insert a department and delete one by id.
 *
 * Used By:
 * tests/db/*, db.fixtures.ts, EmployeeRepository-related setup
 *
 * Dependencies:
 * @repositories/base.repository, @database/query-runner,
 * @models/department.model (Department)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * All queries are parameterized (injection-safe).
 * --------------------------------------------------------
 */
import { BaseRepository } from '@repositories/base.repository';
import { QueryRunner } from '@database/query-runner';
import type { Department } from '@models/department.model';

/**
 * Repository for the `departments` table.
 *
 * Extends {@link BaseRepository}; inherits `count()` and the shared
 * {@link QueryRunner}.
 */
export class DepartmentRepository extends BaseRepository {
  protected readonly table = 'departments';

  constructor(runner: QueryRunner = new QueryRunner()) {
    super(runner);
  }

  /**
   * Look up a department by its unique name.
   *
   * @param name Department name to match exactly.
   * @returns The matching {@link Department}, or `null` if none exists.
   */
  public async findByName(name: string): Promise<Department | null> {
    return this.runner.maybeOne<Department>('SELECT * FROM departments WHERE name = $1', [name]);
  }

  /**
   * Insert a new department and return the persisted row.
   *
   * @param name Department name to create.
   * @returns The inserted {@link Department} (via RETURNING *).
   * @throws {Error} If the insert does not yield exactly one row
   *         (e.g. a duplicate-name constraint violation).
   */
  public async insert(name: string): Promise<Department> {
    return this.runner.one<Department>('INSERT INTO departments (name) VALUES ($1) RETURNING *', [
      name,
    ]);
  }

  /**
   * Delete a department by id (test cleanup / teardown).
   *
   * @param id Department id to remove.
   * @returns Number of rows deleted (0 if none matched).
   * @throws Propagates a FK-violation error if employees still reference it.
   */
  public async deleteById(id: number): Promise<number> {
    return this.runner.none('DELETE FROM departments WHERE id = $1', [id]);
  }
}
