/**
 * --------------------------------------------------------
 * File: employee.spec.ts
 * Module: DB Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: PostgreSQL Employee repository + raw SQL features.
 * Business Scenario: Employee data must persist correctly with integrity guarantees.
 * Preconditions: Reachable, provisioned PostgreSQL (scripts/db/provision.sh).
 * Test Strategy: CRUD + transactions/ROLLBACK, view/index/function, constraint checks.
 * Expected Outcome: Data operations and integrity constraints behave as specified.
 * Priority: High
 * Tags: @db @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Auto-skips every test when no PostgreSQL is reachable.
 * --------------------------------------------------------
 *
 * Database tests — Employee repository + raw SQL validation.
 *
 * Covers: insert/update/delete, transactions + ROLLBACK, a view, an index,
 * a stored function, and constraint/FK enforcement. Auto-skips when no DB is
 * reachable (run `sudo bash scripts/db/provision.sh` to enable). Tagged @db.
 */
import { test, expect } from '@fixtures/index';
import { isDatabaseReachable } from '@database/db-availability';

let dbUp = false;

test.beforeAll(async () => {
  dbUp = await isDatabaseReachable();
});

test.beforeEach(() => {
  test.skip(!dbUp, 'No PostgreSQL reachable — run scripts/db/provision.sh');
});

test.describe('PostgreSQL · Employee repository @db', () => {
  test('@smoke seed data is present', async ({ employeeRepo }) => {
    expect(await employeeRepo.count()).toBeGreaterThanOrEqual(4);
    const ada = await employeeRepo.findByEmail('ada.lovelace@example.test');
    expect(ada?.first_name).toBe('Ada');
  });

  test('insert → findByEmail → delete (CRUD, parameterized)', async ({
    employeeRepo,
    data,
    dbAssert,
  }) => {
    const email = `qa.${data.uuid().slice(0, 8)}@example.test`;
    const created = await employeeRepo.insert({
      firstName: data.firstName(),
      lastName: data.lastName(),
      email,
      departmentId: 2,
      salary: 70000,
    });
    expect(created.id).toBeGreaterThan(0);
    await dbAssert.assertExists('employees', 'email = $1', [email]);

    await employeeRepo.deleteByEmail(email);
    await dbAssert.assertNotExists('employees', 'email = $1', [email]);
  });

  test('updateSalary persists the new value', async ({ employeeRepo }) => {
    const grace = await employeeRepo.findByEmail('grace.hopper@example.test');
    expect(grace).not.toBeNull();
    const updated = await employeeRepo.updateSalary(grace!.id, 100000);
    expect(Number(updated.salary)).toBe(100000);
    // restore
    await employeeRepo.updateSalary(grace!.id, 91000);
  });

  test('transaction ROLLBACK leaves no trace', async ({ db, dbAssert, data }) => {
    const email = `rollback.${data.uuid().slice(0, 8)}@example.test`;
    await expect(
      db.transaction(async (client) => {
        await client.query(
          'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
          ['Roll', 'Back', email, 1, 50000],
        );
        throw new Error('force rollback'); // triggers ROLLBACK
      }),
    ).rejects.toThrow('force rollback');

    await dbAssert.assertNotExists('employees', 'email = $1', [email]);
  });

  test('stored function give_raise() returns increased salary', async ({ employeeRepo }) => {
    const alan = await employeeRepo.findByEmail('alan.turing@example.test');
    const before = Number(alan!.salary);
    const after = await employeeRepo.giveRaise(alan!.id, 10);
    expect(after).toBeCloseTo(before * 1.1, 1);
    await employeeRepo.updateSalary(alan!.id, before); // restore
  });

  test('view active_employees excludes inactive rows', async ({ db }) => {
    const rows = await db.query<{ email: string }>('SELECT email FROM active_employees');
    const emails = rows.map((r) => r.email);
    expect(emails).toContain('ada.lovelace@example.test');
    expect(emails).not.toContain('edsger.dijkstra@example.test'); // is_active = false
  });

  test('index idx_employees_last_name exists', async ({ db }) => {
    const rows = await db.query<{ indexname: string }>(
      "SELECT indexname FROM pg_indexes WHERE tablename = 'employees'",
    );
    expect(rows.map((r) => r.indexname)).toContain('idx_employees_last_name');
  });

  test('CHECK constraint rejects non-positive salary', async ({ db, data }) => {
    await expect(
      db.none(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['Bad', 'Salary', `bad.${data.uuid().slice(0, 8)}@example.test`, 1, -5],
      ),
    ).rejects.toThrow();
  });

  test('FK constraint rejects unknown department', async ({ db, data }) => {
    await expect(
      db.none(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['No', 'Dept', `nodept.${data.uuid().slice(0, 8)}@example.test`, 9999, 50000],
      ),
    ).rejects.toThrow();
  });
});
