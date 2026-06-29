/**
 * --------------------------------------------------------
 * File: db.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Final link in the fixture chain — injects a QueryRunner, DbAssertions, and
 * repositories so tests can read/assert against the database directly.
 *
 * Responsibilities:
 * - Provide TEST-scoped db, dbAssert, and repository fixtures.
 * - Share the single process-wide connection pool across all of them.
 *
 * Used By:
 * @fixtures/index (re-exports this composed `test`), and all DB-touching specs.
 *
 * Dependencies:
 * @fixtures/api.fixtures (chain parent), @database/query-runner,
 * @database/db-assertions, @repositories/*.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * The pool itself is a process Singleton (see @database/db-pool); these
 * fixtures are lightweight wrappers created per test but sharing that one pool.
 * The pool is released in the global teardown hook.
 * --------------------------------------------------------
 *
 * FIXTURE FLOW: base.fixtures → page.fixtures → api.fixtures → db.fixtures (here)
 * This is the fully composed `test` surfaced by @fixtures/index.
 */
import { test as base } from '@fixtures/api.fixtures';
import { QueryRunner } from '@database/query-runner';
import { DbAssertions } from '@database/db-assertions';
import { EmployeeRepository } from '@repositories/employee.repository';
import { DepartmentRepository } from '@repositories/department.repository';
import { ProductRecordRepository } from '@repositories/product-record.repository';

interface DbFixtures {
  readonly db: QueryRunner;
  readonly dbAssert: DbAssertions;
  readonly employeeRepo: EmployeeRepository;
  readonly departmentRepo: DepartmentRepository;
  readonly productRecordRepo: ProductRecordRepository;
}

export const test = base.extend<DbFixtures>({
  db: async ({}, use) => {
    await use(new QueryRunner());
  },
  dbAssert: async ({ db }, use) => {
    await use(new DbAssertions(db));
  },
  employeeRepo: async ({ db }, use) => {
    await use(new EmployeeRepository(db));
  },
  departmentRepo: async ({ db }, use) => {
    await use(new DepartmentRepository(db));
  },
  productRecordRepo: async ({ db }, use) => {
    await use(new ProductRecordRepository(db));
  },
});

export { expect } from '@fixtures/base.fixtures';
