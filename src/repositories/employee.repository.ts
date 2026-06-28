/**
 * --------------------------------------------------------
 * File: employee.repository.ts
 * Module: Repositories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Data-access layer for the `employees` table — lookups, inserts, salary
 * updates, deactivation/deletion, and a stored-function raise call.
 *
 * Responsibilities:
 * - Find employees by id, email, or department.
 * - Insert new employees and update/RETURNING the persisted row.
 * - Deactivate, delete, and apply raises via the give_raise() DB function.
 *
 * Used By:
 * tests/db/*, E2E DB sync, db.fixtures.ts
 *
 * Dependencies:
 * @repositories/base.repository, @database/query-runner,
 * @models/employee.model (Employee, NewEmployee)
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Every query is parameterized ($1, $2 …) — injection-safe.
 * --------------------------------------------------------
 */
import { BaseRepository } from '@repositories/base.repository';
import { QueryRunner } from '@database/query-runner';
import type { Employee, NewEmployee } from '@models/employee.model';
import type { Maybe } from '@apptypes/index';

/**
 * Repository for the `employees` table.
 *
 * Extends {@link BaseRepository}; all reads/writes go through the inherited
 * {@link QueryRunner} using bound parameters.
 */
export class EmployeeRepository extends BaseRepository {
  protected readonly table = 'employees';

  constructor(runner: QueryRunner = new QueryRunner()) {
    super(runner);
  }

  /**
   * Look up an employee by primary key.
   *
   * @param id Employee id.
   * @returns The matching {@link Employee}, or `null` if none exists.
   */
  public async findById(id: number): Promise<Maybe<Employee>> {
    return this.runner.maybeOne<Employee>('SELECT * FROM employees WHERE id = $1', [id]);
  }

  /**
   * Look up an employee by their unique email address.
   *
   * @param email Email to match exactly.
   * @returns The matching {@link Employee}, or `null` if none exists.
   */
  public async findByEmail(email: string): Promise<Maybe<Employee>> {
    return this.runner.maybeOne<Employee>('SELECT * FROM employees WHERE email = $1', [email]);
  }

  /**
   * List all employees in a department, ordered by last name.
   *
   * @param departmentId Department foreign-key id.
   * @returns Array of {@link Employee} rows (empty if none).
   */
  public async findByDepartment(departmentId: number): Promise<Employee[]> {
    return this.runner.query<Employee>(
      'SELECT * FROM employees WHERE department_id = $1 ORDER BY last_name',
      [departmentId],
    );
  }

  /**
   * Insert a new employee and return the persisted row.
   *
   * @param employee New employee data; `isActive` defaults to `true`.
   * @returns The inserted {@link Employee} (via RETURNING *).
   * @throws {Error} If the insert affects other than exactly one row
   *         (e.g. a unique-email constraint violation surfaces here).
   */
  public async insert(employee: NewEmployee): Promise<Employee> {
    return this.runner.one<Employee>(
      `INSERT INTO employees (first_name, last_name, email, department_id, salary, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.departmentId,
        employee.salary,
        employee.isActive ?? true,
      ],
    );
  }

  /**
   * Update an employee's salary and return the updated row.
   *
   * @param id     Employee id to update.
   * @param salary New salary value.
   * @returns The updated {@link Employee} (via RETURNING *).
   * @throws {Error} If no employee with `id` exists (not exactly one row).
   */
  public async updateSalary(id: number, salary: number): Promise<Employee> {
    return this.runner.one<Employee>('UPDATE employees SET salary = $2 WHERE id = $1 RETURNING *', [
      id,
      salary,
    ]);
  }

  /**
   * Soft-delete an employee by flagging them inactive.
   *
   * @param id Employee id to deactivate.
   * @returns Number of rows updated (0 if the id did not exist).
   */
  public async deactivate(id: number): Promise<number> {
    return this.runner.none('UPDATE employees SET is_active = FALSE WHERE id = $1', [id]);
  }

  /**
   * Hard-delete an employee by email (used for test cleanup).
   *
   * @param email Email of the employee to remove.
   * @returns Number of rows deleted (0 if none matched).
   */
  public async deleteByEmail(email: string): Promise<number> {
    return this.runner.none('DELETE FROM employees WHERE email = $1', [email]);
  }

  /**
   * Apply a percentage raise via the database stored function
   * `give_raise(emp_id, pct)`.
   *
   * @param id  Employee id receiving the raise.
   * @param pct Raise percentage passed to the function.
   * @returns The new salary returned by `give_raise`, coerced to a number.
   * @throws {Error} If the function does not return exactly one row.
   */
  public async giveRaise(id: number, pct: number): Promise<number> {
    const row = await this.runner.one<{ give_raise: string }>('SELECT give_raise($1, $2)', [
      id,
      pct,
    ]);
    return Number(row.give_raise);
  }
}
