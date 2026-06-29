/**
 * --------------------------------------------------------
 * File: employee.builder.ts
 * Module: Builders
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Fluent builder for {@link NewEmployee} rows — valid randomized defaults plus
 * variants that exercise the DB integrity rules (CHECK salary > 0, FK on
 * department), so database/E2E tests declare intent instead of literals.
 *
 * Responsibilities:
 * - Seed a valid, randomized employee with a UNIQUE email (safe for shared DBs).
 * - Offer chainable mutators (name, email, department, salary, active flag).
 * - Offer invalid/boundary variants (non-positive salary, unknown department).
 *
 * Used By:
 * @factories/employee.factory; tests/db/* and BDD database steps.
 *
 * Dependencies:
 * @faker-js/faker, @builders/builder (AbstractBuilder), @models/employee.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';
import { AbstractBuilder } from '@builders/builder';
import type { NewEmployee } from '@models/employee.model';

/** Seeded departments present in schema.sql (1=Eng, 2=QA, 3=Ops). */
const SEEDED_DEPARTMENTS = [1, 2, 3] as const;

/** Generate a collision-free email so shared-database inserts never clash. */
function uniqueEmail(first: string, last: string): string {
  const tag = `${Date.now().toString(36)}${faker.string.alphanumeric(4)}`;
  return `${first}.${last}.${tag}@example.test`.toLowerCase();
}

/**
 * Builds {@link NewEmployee} rows. Entry point: {@link EmployeeBuilder.valid}.
 * @example EmployeeBuilder.valid().inDepartment(2).withSalary(95_000).build();
 */
export class EmployeeBuilder extends AbstractBuilder<NewEmployee> {
  private constructor(seed: NewEmployee) {
    super(seed);
  }

  /** A valid, randomized employee with a unique email and a seeded department. */
  public static valid(): EmployeeBuilder {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return new EmployeeBuilder({
      firstName,
      lastName,
      email: uniqueEmail(firstName, lastName),
      departmentId: faker.helpers.arrayElement(SEEDED_DEPARTMENTS),
      salary: faker.number.int({ min: 40_000, max: 150_000 }),
      isActive: true,
    });
  }

  public withName(firstName: string, lastName: string): this {
    return this.with({ firstName, lastName, email: uniqueEmail(firstName, lastName) });
  }

  public withEmail(email: string): this {
    return this.with({ email });
  }

  public inDepartment(departmentId: number): this {
    return this.with({ departmentId });
  }

  public withSalary(salary: number): this {
    return this.with({ salary });
  }

  public active(): this {
    return this.with({ isActive: true });
  }

  public inactive(): this {
    return this.with({ isActive: false });
  }

  /** Boundary: the smallest salary the CHECK constraint allows. */
  public withMinimumSalary(): this {
    return this.with({ salary: 1 });
  }

  /** Invalid: a non-positive salary (violates the CHECK constraint). */
  public static invalidNonPositiveSalary(): EmployeeBuilder {
    return EmployeeBuilder.valid().with({ salary: -5 });
  }

  /** Invalid: a department id that does not exist (violates the foreign key). */
  public static invalidUnknownDepartment(): EmployeeBuilder {
    return EmployeeBuilder.valid().with({ departmentId: 9_999 });
  }
}
