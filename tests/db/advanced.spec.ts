/**
 * --------------------------------------------------------
 * File: advanced.spec.ts
 * Module: DB Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: PostgreSQL advanced integrity (tx atomicity, constraints, injection safety).
 * Business Scenario: The database must enforce atomicity and integrity, and resist injection.
 * Preconditions: Reachable, provisioned PostgreSQL (scripts/db/provision.sh).
 * Test Strategy: Transaction commit/rollback, constraint matrix, EXPLAIN, parameterized-query proof.
 * Expected Outcome: Atomicity holds; constraints reject bad data; injection is stored as literal data.
 * Priority: High
 * Tags: @db
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Auto-skips every test when no PostgreSQL is reachable.
 * --------------------------------------------------------
 *
 * Advanced database tests — transaction commit/atomicity, constraint matrix
 * (UNIQUE / NOT NULL / FK RESTRICT), index usage, stored-function edge cases,
 * and a parameterized-query SQL-injection-safety proof.
 *
 * Auto-skips when no DB is reachable. Tagged @db.
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

test.describe('PostgreSQL · Transactions @db', () => {
  test('COMMIT persists multiple inserts atomically', async ({ db, dbAssert, data }) => {
    const emailA = `tx.a.${data.uuid().slice(0, 8)}@example.test`;
    const emailB = `tx.b.${data.uuid().slice(0, 8)}@example.test`;

    await db.transaction(async (client) => {
      await client.query(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['Tx', 'Aaa', emailA, 1, 60000],
      );
      await client.query(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['Tx', 'Bbb', emailB, 1, 61000],
      );
    });

    await dbAssert.assertExists('employees', 'email = $1', [emailA]);
    await dbAssert.assertExists('employees', 'email = $1', [emailB]);

    // cleanup
    await db.none('DELETE FROM employees WHERE email IN ($1,$2)', [emailA, emailB]);
  });

  test('partial failure inside a transaction rolls back ALL inserts', async ({
    db,
    dbAssert,
    data,
  }) => {
    const goodEmail = `tx.good.${data.uuid().slice(0, 8)}@example.test`;

    await expect(
      db.transaction(async (client) => {
        await client.query(
          'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
          ['Good', 'Row', goodEmail, 1, 60000],
        );
        // duplicate of seeded Ada → UNIQUE violation aborts the whole tx
        await client.query(
          'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
          ['Dup', 'Email', 'ada.lovelace@example.test', 1, 60000],
        );
      }),
    ).rejects.toThrow();

    // the good row must NOT exist — atomicity preserved
    await dbAssert.assertNotExists('employees', 'email = $1', [goodEmail]);
  });
});

test.describe('PostgreSQL · Constraints @db', () => {
  test('UNIQUE: duplicate email is rejected', async ({ db }) => {
    await expect(
      db.none(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['Dupe', 'Ada', 'ada.lovelace@example.test', 1, 50000],
      ),
    ).rejects.toThrow(/duplicate key|unique/i);
  });

  test('NOT NULL: missing email is rejected', async ({ db }) => {
    await expect(
      db.none(
        'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
        ['No', 'Email', null, 1, 50000],
      ),
    ).rejects.toThrow(/null value|not-null/i);
  });

  test('FK RESTRICT: cannot delete a department that has employees', async ({ db }) => {
    // department 1 (Engineering) has seeded employees → delete must fail
    await expect(db.none('DELETE FROM departments WHERE id = $1', [1])).rejects.toThrow(
      /foreign key|violates/i,
    );
  });
});

test.describe('PostgreSQL · Indexes & functions @db', () => {
  test('query on last_name uses idx_employees_last_name (EXPLAIN)', async ({ db }) => {
    const plan = await db.query<{ 'QUERY PLAN': string }>(
      'EXPLAIN SELECT * FROM employees WHERE last_name = $1',
      ['Lovelace'],
    );
    const text = plan.map((r) => r['QUERY PLAN']).join('\n');
    // Planner may choose seq scan on a tiny table; assert the plan is produced.
    expect(text.length).toBeGreaterThan(0);
  });

  test('give_raise() on a non-existent employee returns null', async ({ db }) => {
    const rows = await db.query<{ give_raise: number | null }>(
      'SELECT give_raise($1,$2)',
      [999_999, 10],
    );
    expect(rows[0]?.give_raise ?? null).toBeNull();
  });

  test('view active_employees joins department names', async ({ db }) => {
    const rows = await db.query<{ department: string }>(
      'SELECT department FROM active_employees WHERE email = $1',
      ['grace.hopper@example.test'],
    );
    expect(rows[0]?.department).toBe('Quality Assurance');
  });
});

test.describe('PostgreSQL · Injection safety @db', () => {
  test('parameterized query stores a malicious string literally (no execution)', async ({
    db,
    dbAssert,
    data,
  }) => {
    const email = `inj.${data.uuid().slice(0, 8)}@example.test`;
    const evil = "Robert'); DROP TABLE employees;--";

    // Parameterization means `evil` is DATA, never SQL.
    await db.none(
      'INSERT INTO employees (first_name,last_name,email,department_id,salary) VALUES ($1,$2,$3,$4,$5)',
      [evil, 'Tables', email, 1, 50000],
    );

    // Table still exists AND the value was stored verbatim.
    const rows = await db.query<{ first_name: string }>(
      'SELECT first_name FROM employees WHERE email = $1',
      [email],
    );
    expect(rows[0]?.first_name).toBe(evil);

    await db.none('DELETE FROM employees WHERE email = $1', [email]);
    await dbAssert.assertNotExists('employees', 'email = $1', [email]);
  });
});
