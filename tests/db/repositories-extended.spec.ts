/**
 * --------------------------------------------------------
 * File: repositories-extended.spec.ts
 * Module: DB Tests · Repositories (edge cases)
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Repository edge-case behaviour (null lookups, soft delete,
 *                     upsert idempotency, round-trip counts).
 * Preconditions: Reachable, provisioned PostgreSQL.
 * Test Strategy: Boundary/negative repository operations with cleanup.
 * Expected Outcome: Null for misses; soft delete flips the flag; upsert keeps one row.
 * Priority: Medium
 * Tags: @db
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
/* eslint-disable playwright/prefer-to-have-count -- repo.count() is a DB query, not a locator */
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

const newExternalId = (): number => 9_500_000 + Math.floor(Math.random() * 400_000);

test.describe('PostgreSQL · Repository edge cases @db', () => {
  test('findById returns null for an unknown id', async ({ employeeRepo }) => {
    expect(await employeeRepo.findById(999_999)).toBeNull();
  });

  test('findByDepartment returns empty for a non-existent department', async ({ employeeRepo }) => {
    expect(await employeeRepo.findByDepartment(999_999)).toEqual([]);
  });

  test('deactivate flips is_active to false', async ({ employeeRepo }) => {
    const emp = EmployeeFactory.valid();
    const inserted = await employeeRepo.insert(emp);
    try {
      expect(inserted.is_active).toBe(true);
      const affected = await employeeRepo.deactivate(inserted.id);
      expect(affected).toBe(1);
      const after = await employeeRepo.findById(inserted.id);
      expect(after?.is_active).toBe(false);
    } finally {
      await employeeRepo.deleteByEmail(emp.email);
    }
  });

  test('department insert + delete round-trips the row count', async ({ departmentRepo, data }) => {
    const before = await departmentRepo.count();
    const created = await departmentRepo.insert(`Dept ${data.uuid().slice(0, 8)}`);
    const deleted = await departmentRepo.deleteById(created.id);
    expect(deleted).toBe(1);
    const after = await departmentRepo.count();
    expect(after).toBe(before);
  });

  test('upsert twice keeps a single row for one external id', async ({ productRecordRepo }) => {
    const externalId = newExternalId();
    try {
      await productRecordRepo.upsert({ externalId, title: 'A', price: 1 });
      await productRecordRepo.upsert({ externalId, title: 'B', price: 2 });
      // A second delete returning 0 would prove duplicates; here exactly one row deletes.
      expect(await productRecordRepo.deleteByExternalId(externalId)).toBe(1);
      expect(await productRecordRepo.findByExternalId(externalId)).toBeNull();
    } finally {
      await productRecordRepo.deleteByExternalId(externalId);
    }
  });

  test('updateSalary returns the persisted new salary', async ({ employeeRepo }) => {
    const emp = EmployeeFactory.valid();
    const inserted = await employeeRepo.insert(emp);
    try {
      const updated = await employeeRepo.updateSalary(inserted.id, 123_456);
      expect(Number(updated.salary)).toBe(123_456);
    } finally {
      await employeeRepo.deleteByEmail(emp.email);
    }
  });
});
