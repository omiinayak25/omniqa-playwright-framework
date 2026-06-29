/**
 * --------------------------------------------------------
 * File: employee.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Employee domain models for the DB layer and E2E flows (persisted record
 * plus insert payload).
 *
 * Responsibilities:
 * - Type the employee row and the new-employee insert input.
 *
 * Used By:
 * Employee repositories and DB/E2E tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Employee field names are snake_case to match PostgreSQL columns; the insert
 * payload (NewEmployee) is camelCase to match application code.
 * --------------------------------------------------------
 */

/** A persisted employee row (snake_case fields mirror PostgreSQL columns). */
export interface Employee {
  readonly id: number;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly department_id: number;
  readonly salary: number;
  readonly is_active: boolean;
  readonly created_at: Date;
}

/** Payload for inserting a new employee. */
export interface NewEmployee {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly departmentId: number;
  readonly salary: number;
  readonly isActive?: boolean;
}
