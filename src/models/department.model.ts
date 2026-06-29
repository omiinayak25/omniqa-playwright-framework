/**
 * --------------------------------------------------------
 * File: department.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Department domain model (organizational unit referenced by employees).
 *
 * Responsibilities:
 * - Type the department record used across DB and E2E flows.
 *
 * Used By:
 * Employee/department repositories and tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * --------------------------------------------------------
 */

/** A department record: numeric id and display name. */
export interface Department {
  readonly id: number;
  readonly name: string;
}
