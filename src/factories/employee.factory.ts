/**
 * --------------------------------------------------------
 * File: employee.factory.ts
 * Module: Factories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Produces {@link NewEmployee} datasets — valid, inactive, bulk, per-department,
 * edge and labelled invalid cases — by composing EmployeeBuilder.
 *
 * Dependencies:
 * @builders (EmployeeBuilder), @factories/factory (generate), @models/employee.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { EmployeeBuilder } from '@builders/index';
import { generate } from '@factories/factory';
import type { NewEmployee } from '@models/employee.model';

/** A named invalid case (payload + why it is invalid). */
export interface InvalidEmployee {
  readonly label: string;
  readonly employee: NewEmployee;
}

/** Dataset factory for {@link NewEmployee} rows (composes EmployeeBuilder). */
export class EmployeeFactory {
  /** One valid, randomized employee (unique email). */
  public static valid(): NewEmployee {
    return EmployeeBuilder.valid().build();
  }

  /** One valid but inactive employee. */
  public static inactive(): NewEmployee {
    return EmployeeBuilder.valid().inactive().build();
  }

  /** `count` valid employees, each with a unique email. */
  public static many(count: number): NewEmployee[] {
    return generate(count, () => EmployeeBuilder.valid().build());
  }

  /** `count` valid employees pinned to one department. */
  public static forDepartment(departmentId: number, count: number): NewEmployee[] {
    return generate(count, () => EmployeeBuilder.valid().inDepartment(departmentId).build());
  }

  /** Edge case: the minimum salary the CHECK constraint permits. */
  public static edgeCases(): NewEmployee[] {
    return [EmployeeBuilder.valid().withMinimumSalary().build()];
  }

  /** Labelled invalid cases for negative/constraint testing. */
  public static invalidCases(): readonly InvalidEmployee[] {
    return [
      { label: 'non-positive salary', employee: EmployeeBuilder.invalidNonPositiveSalary().build() },
      { label: 'unknown department', employee: EmployeeBuilder.invalidUnknownDepartment().build() },
    ];
  }
}
