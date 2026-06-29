/**
 * --------------------------------------------------------
 * File: repositories.spec.ts
 * Module: DB Tests · Repositories
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Repository-layer CRUD (Employee / Department / Product).
 * Business Scenario: The repositories must read-after-write consistently, honour
 *                    no-op deletes/updates, order results, and keep counts accurate.
 * Preconditions: Reachable, provisioned PostgreSQL (scripts/db/provision.sh).
 * Test Strategy: Exercise each repository's public methods (not raw SQL), with
 *                builder-generated data and per-test cleanup.
 * Expected Outcome: Repository methods behave to contract; no leftover rows.
 * Priority: High
 * Tags: @db
 *
 * Last Updated: 2026-06-28
 * Notes: Complements employee.spec.ts / advanced.spec.ts (raw-SQL & constraints)
 * by covering the Repository abstraction itself. Auto-skips without a DB.
 * --------------------------------------------------------
 */
// repo.count() is a parameterised DB query, not a Playwright locator — the
// prefer-to-have-count rule is a false positive throughout this file.
/* eslint-disable playwright/prefer-to-have-count */
import { test, expect } from '@fixtures/index';
import { isDatabaseReachable } from '@database/db-availability';
import { EmployeeFactory } from '@factories/index';

let dbUp = false;

test.beforeAll(async () => {
  dbUp = await isDatabaseReachable();
});

test.beforeEach(() => {
  test.skip(!dbUp, 'No PostgreSQL reachable — run scripts/db/provision.sh');
});

// A collision-free external id for product-sync tests.
const newExternalId = (): number => 9_000_000 + Math.floor(Math.random() * 1_000_000);

test.describe('PostgreSQL · Department repository @db', () => {
  test('insert then findByName returns the row (read-after-write)', async ({
    departmentRepo,
    data,
  }) => {
    const name = `Dept ${data.uuid().slice(0, 8)}`;
    const created = await departmentRepo.insert(name);
    try {
      const found = await departmentRepo.findByName(name);
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(name);
    } finally {
      await departmentRepo.deleteById(created.id);
    }
  });

  test('findByName returns null for an unknown department', async ({ departmentRepo, data }) => {
    expect(await departmentRepo.findByName(`missing-${data.uuid()}`)).toBeNull();
  });

  test('count increases by one after an insert', async ({ departmentRepo, data }) => {
    const before = await departmentRepo.count();
    const created = await departmentRepo.insert(`Dept ${data.uuid().slice(0, 8)}`);
    try {
      const after = await departmentRepo.count();
      expect(after).toBe(before + 1);
    } finally {
      await departmentRepo.deleteById(created.id);
    }
  });
});

test.describe('PostgreSQL · Product-record repository @db', () => {
  test('upsert inserts a new product then finds it', async ({ productRecordRepo }) => {
    const externalId = newExternalId();
    try {
      await productRecordRepo.upsert({
        externalId,
        title: 'Widget',
        price: 9.99,
        category: 'tools',
      });
      const found = await productRecordRepo.findByExternalId(externalId);
      expect(found?.external_id).toBe(externalId);
      expect(found?.title).toBe('Widget');
    } finally {
      await productRecordRepo.deleteByExternalId(externalId);
    }
  });

  test('upsert updates in place without creating a duplicate', async ({ productRecordRepo }) => {
    const externalId = newExternalId();
    try {
      await productRecordRepo.upsert({ externalId, title: 'V1', price: 10, category: 'a' });
      await productRecordRepo.upsert({ externalId, title: 'V2', price: 20, category: 'b' });
      const found = await productRecordRepo.findByExternalId(externalId);
      expect(found?.title).toBe('V2');
      expect(Number(found?.price)).toBeCloseTo(20, 2);
    } finally {
      await productRecordRepo.deleteByExternalId(externalId);
    }
  });

  test('delete removes the product (findByExternalId → null)', async ({ productRecordRepo }) => {
    const externalId = newExternalId();
    await productRecordRepo.upsert({ externalId, title: 'Temp', price: 1 });
    const deleted = await productRecordRepo.deleteByExternalId(externalId);
    expect(deleted).toBe(1);
    expect(await productRecordRepo.findByExternalId(externalId)).toBeNull();
  });

  test('findByExternalId returns null for an unsynced id', async ({ productRecordRepo }) => {
    expect(await productRecordRepo.findByExternalId(newExternalId())).toBeNull();
  });
});

test.describe('PostgreSQL · Employee repository @db', () => {
  test('insert then findByEmail returns the persisted row', async ({ employeeRepo }) => {
    const emp = EmployeeFactory.valid();
    const inserted = await employeeRepo.insert(emp);
    try {
      const found = await employeeRepo.findByEmail(emp.email);
      expect(found?.id).toBe(inserted.id);
      expect(found?.email).toBe(emp.email);
    } finally {
      await employeeRepo.deleteByEmail(emp.email);
    }
  });

  test('count increases by one after an insert', async ({ employeeRepo }) => {
    const before = await employeeRepo.count();
    const emp = EmployeeFactory.valid();
    await employeeRepo.insert(emp);
    try {
      const after = await employeeRepo.count();
      expect(after).toBe(before + 1);
    } finally {
      await employeeRepo.deleteByEmail(emp.email);
    }
  });

  test('deactivating a non-existent employee affects zero rows', async ({ employeeRepo }) => {
    expect(await employeeRepo.deactivate(999_999)).toBe(0);
  });

  test('deleting a non-existent email affects zero rows', async ({ employeeRepo, data }) => {
    expect(await employeeRepo.deleteByEmail(`ghost-${data.uuid()}@example.test`)).toBe(0);
  });

  test('findByDepartment returns rows ordered by last name', async ({ employeeRepo }) => {
    const rows = await employeeRepo.findByDepartment(1);
    const lastNames = rows.map((r) => r.last_name);
    expect(lastNames).toEqual([...lastNames].sort((a, b) => a.localeCompare(b)));
  });
});

test.describe('PostgreSQL · DB assertions helper @db', () => {
  test('assertExists/assertNotExists track an insert and delete', async ({
    employeeRepo,
    dbAssert,
  }) => {
    const emp = EmployeeFactory.valid();
    await employeeRepo.insert(emp);
    await dbAssert.assertExists('employees', 'email = $1', [emp.email]);

    await employeeRepo.deleteByEmail(emp.email);
    await dbAssert.assertNotExists('employees', 'email = $1', [emp.email]);
  });
});
