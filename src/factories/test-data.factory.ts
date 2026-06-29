/**
 * --------------------------------------------------------
 * File: test-data.factory.ts
 * Module: Factories
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Facade over every domain factory — one entry point (`TestDataFactory`) for all
 * test data, plus a generic `dataset()` helper.
 *
 * Dependencies:
 * @factories/* (booking, employee, product, user, factory).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { BookingFactory } from '@factories/booking.factory';
import { EmployeeFactory } from '@factories/employee.factory';
import { ProductFactory } from '@factories/product.factory';
import { UserFactory } from '@factories/user.factory';
import { generate } from '@factories/factory';

/** Unified facade exposing every domain factory and a generic generator. */
export class TestDataFactory {
  public static readonly booking = BookingFactory;
  public static readonly employee = EmployeeFactory;
  public static readonly product = ProductFactory;
  public static readonly user = UserFactory;

  /** Generic bulk generator for ad-hoc dataset needs. */
  public static dataset<T>(count: number, make: (index: number) => T): T[] {
    return generate(count, make);
  }
}
