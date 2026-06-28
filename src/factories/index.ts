/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Factories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel export for the Factory layer (`@factories`).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export { generate } from '@factories/factory';
export { BookingFactory, type InvalidBooking } from '@factories/booking.factory';
export { EmployeeFactory, type InvalidEmployee } from '@factories/employee.factory';
export { ProductFactory } from '@factories/product.factory';
export { UserFactory } from '@factories/user.factory';
export { TestDataFactory } from '@factories/test-data.factory';
