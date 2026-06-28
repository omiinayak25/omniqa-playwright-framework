/**
 * --------------------------------------------------------
 * File: database.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Employee database BDD steps (CRUD, tx, view, index, fn).
 * Business Scenario: Gherkin DB scenarios drive the Repository + QueryRunner.
 * Preconditions: Embedded PGlite pool (lazily created + seeded from schema.sql).
 * Test Strategy: BDD glue reusing EmployeeRepository / QueryRunner / DbAssertions.
 * Expected Outcome: DB steps map cleanly to repository/query actions.
 * Priority: High
 * Tags: (driven by features/database/database.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * These steps reuse the SAME data layer as the Playwright DB specs. State (the
 * "current" employee id/email) is carried via the World bag. Emails are unique
 * per step so scenarios sharing one in-process database never collide.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { QueryRunner } from '@database/query-runner';
import { DbAssertions } from '@database/db-assertions';
import { isDatabaseReachable } from '@database/db-availability';
import { EmployeeRepository } from '@repositories/employee.repository';
import type { CustomWorld } from '@bdd/world';

const INSERT_SQL =
  'INSERT INTO employees (first_name, last_name, email, department_id, salary) VALUES ($1, $2, $3, $4, $5)';

/** Generate a collision-free email for the shared in-process database. */
function uniqueEmail(): string {
  return `qa.${Date.now()}.${Math.floor(Math.random() * 1_000_000)}@example.test`;
}

// ------------------------------------------------------------------- background
Given('the automation database is reachable', async function (this: CustomWorld) {
  expect(await isDatabaseReachable()).toBe(true);
});

// ------------------------------------------------------------------- CRUD
When(
  'I hire an employee {string} {string} in department {int} earning {int}',
  async function (this: CustomWorld, first: string, last: string, dept: number, salary: number) {
    const email = uniqueEmail();
    this.set('empEmail', email);
    const employee = await new EmployeeRepository().insert({
      firstName: first,
      lastName: last,
      email,
      departmentId: dept,
      salary,
    });
    this.set('empId', employee.id);
    this.set('inserted', employee);
  },
);

When("I change that employee's salary to {int}", async function (this: CustomWorld, salary: number) {
  await new EmployeeRepository().updateSalary(this.get<number>('empId'), salary);
});

When('I terminate that employee', async function (this: CustomWorld) {
  await new EmployeeRepository().deleteByEmail(this.get<string>('empEmail'));
});

When(
  'I apply a {int} percent raise to that employee via the stored function',
  async function (this: CustomWorld, pct: number) {
    const repo = new EmployeeRepository();
    const before = await repo.findById(this.get<number>('empId'));
    this.set('salaryBefore', Number(before?.salary));
    this.set('salaryAfter', await repo.giveRaise(this.get<number>('empId'), pct));
  },
);

// ------------------------------------------------------------------- transactions
When('I insert an employee in a transaction that fails', async function (this: CustomWorld) {
  const email = uniqueEmail();
  this.set('empEmail', email);
  try {
    await new QueryRunner().transaction(async (client) => {
      await client.query(INSERT_SQL, ['Roll', 'Back', email, 1, 50_000]);
      throw new Error('force rollback');
    });
  } catch {
    /* expected — the rollback is what we assert on next */
  }
});

When('I insert two employees in a successful transaction', async function (this: CustomWorld) {
  const emails = [uniqueEmail(), uniqueEmail()];
  this.set('empEmails', emails);
  await new QueryRunner().transaction(async (client) => {
    await client.query(INSERT_SQL, ['Tx', 'One', emails[0], 1, 60_000]);
    await client.query(INSERT_SQL, ['Tx', 'Two', emails[1], 1, 61_000]);
  });
});

// ------------------------------------------------------------------- constraints
When('I try to insert an employee with salary {int}', async function (this: CustomWorld, salary: number) {
  this.set('insertRejected', await attemptInsert(['Bad', 'Salary', uniqueEmail(), 1, salary]));
});

When('I try to insert an employee in department {int}', async function (this: CustomWorld, dept: number) {
  this.set('insertRejected', await attemptInsert(['No', 'Dept', uniqueEmail(), dept, 50_000]));
});

async function attemptInsert(params: ReadonlyArray<unknown>): Promise<boolean> {
  try {
    await new QueryRunner().none(INSERT_SQL, params);
    return false;
  } catch {
    return true;
  }
}

// ------------------------------------------------------------------- assertions
Then('the new employee should have a positive id', function (this: CustomWorld) {
  expect(this.get<{ id: number }>('inserted').id).toBeGreaterThan(0);
});

Then('an employee with that email should exist', async function (this: CustomWorld) {
  await new DbAssertions().assertExists('employees', 'email = $1', [this.get<string>('empEmail')]);
});

Then('no employee with that email should exist', async function (this: CustomWorld) {
  await new DbAssertions().assertNotExists('employees', 'email = $1', [this.get<string>('empEmail')]);
});

Then('both employees should exist', async function (this: CustomWorld) {
  const assertions = new DbAssertions();
  for (const email of this.get<string[]>('empEmails')) {
    await assertions.assertExists('employees', 'email = $1', [email]);
  }
});

Then("that employee's salary should be {int}", async function (this: CustomWorld, salary: number) {
  const employee = await new EmployeeRepository().findById(this.get<number>('empId'));
  expect(Number(employee?.salary)).toBe(salary);
});

Then('the new salary should be 10 percent higher', function (this: CustomWorld) {
  expect(this.get<number>('salaryAfter')).toBeCloseTo(this.get<number>('salaryBefore') * 1.1, 1);
});

Then(
  'the active employees view should include {string}',
  async function (this: CustomWorld, email: string) {
    const rows = await new QueryRunner().query<{ email: string }>(
      'SELECT email FROM active_employees',
    );
    expect(rows.map((r) => r.email)).toContain(email);
  },
);

Then(
  'the active employees view should exclude {string}',
  async function (this: CustomWorld, email: string) {
    const rows = await new QueryRunner().query<{ email: string }>(
      'SELECT email FROM active_employees',
    );
    expect(rows.map((r) => r.email)).not.toContain(email);
  },
);

Then(
  'an index named {string} should exist on {string}',
  async function (this: CustomWorld, indexName: string, table: string) {
    const rows = await new QueryRunner().query<{ indexname: string }>(
      'SELECT indexname FROM pg_indexes WHERE tablename = $1',
      [table],
    );
    expect(rows.map((r) => r.indexname)).toContain(indexName);
  },
);

Then('the database should reject it', function (this: CustomWorld) {
  expect(this.get<boolean>('insertRejected')).toBe(true);
});

Then(
  'the employee repository should report at least {int} employees',
  async function (this: CustomWorld, count: number) {
    expect(await new EmployeeRepository().count()).toBeGreaterThanOrEqual(count);
  },
);
