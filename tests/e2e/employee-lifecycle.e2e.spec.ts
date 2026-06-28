/**
 * --------------------------------------------------------
 * File: employee-lifecycle.e2e.spec.ts
 * Module: E2E Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Employee HR lifecycle (hire → raise → deactivate → terminate).
 * Business Scenario: An employee record flows through its full HR lifecycle in the DB.
 * Preconditions: Reachable, provisioned PostgreSQL (scripts/db/provision.sh).
 * Test Strategy: Serial, stateful DB lifecycle across repository + function + view.
 * Expected Outcome: Each lifecycle stage persists and is verified; record ends terminated.
 * Priority: High
 * Tags: @e2e @db
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Serial mode (steps depend on each other); auto-skips when no PostgreSQL is reachable.
 * --------------------------------------------------------
 *
 * E2E · DB lifecycle (Employee onboarding → raise → deactivate → terminate).
 * Exercises repository + stored function + view across a realistic HR flow.
 * Auto-skips when no DB. Serial. Tagged @e2e @db.
 */
import { test, expect } from '@fixtures/index';
import { isDatabaseReachable } from '@database/db-availability';

test.describe.configure({ mode: 'serial' });

let dbUp = false;

test.beforeAll(async () => {
  dbUp = await isDatabaseReachable();
});

test.beforeEach(() => {
  test.skip(!dbUp, 'No PostgreSQL reachable — run scripts/db/provision.sh');
});

test.describe('E2E · Employee lifecycle @e2e @db', () => {
  const email = `e2e.hire.${Math.floor(Date.now() % 1_000_000)}@example.test`;
  let employeeId = 0;
  const startingSalary = 80000;

  test('1 · hire (insert) the employee', async ({ employeeRepo, dbAssert }) => {
    const created = await employeeRepo.insert({
      firstName: 'New',
      lastName: 'Hire',
      email,
      departmentId: 1,
      salary: startingSalary,
    });
    employeeId = created.id;
    expect(employeeId).toBeGreaterThan(0);
    await dbAssert.assertExists('employees', 'email = $1', [email]);
  });

  test('2 · give a 10% raise (stored function) & verify', async ({ employeeRepo }) => {
    const newSalary = await employeeRepo.giveRaise(employeeId, 10);
    expect(newSalary).toBeCloseTo(startingSalary * 1.1, 1);
    const fresh = await employeeRepo.findById(employeeId);
    expect(Number(fresh?.salary)).toBeCloseTo(startingSalary * 1.1, 1);
  });

  test('3 · deactivate & verify excluded from active_employees view', async ({
    employeeRepo,
    db,
  }) => {
    await employeeRepo.deactivate(employeeId);
    const rows = await db.query<{ email: string }>(
      'SELECT email FROM active_employees WHERE email = $1',
      [email],
    );
    expect(rows).toHaveLength(0);
  });

  test('4 · terminate (delete) & verify gone', async ({ employeeRepo, dbAssert }) => {
    await employeeRepo.deleteByEmail(email);
    await dbAssert.assertNotExists('employees', 'email = $1', [email]);
  });
});
