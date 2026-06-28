/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Builders
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel export for the Builder layer — one import surface (`@builders`) for the
 * generic base and every domain builder. Keeps consumer imports stable as
 * builders are added.
 *
 * Used By:
 * @factories/*, specs and BDD step definitions needing test data.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export { AbstractBuilder } from '@builders/builder';
export { BookingBuilder } from '@builders/booking.builder';
export { EmployeeBuilder } from '@builders/employee.builder';
export { CheckoutBuilder } from '@builders/checkout.builder';
export { ProductBuilder } from '@builders/product.builder';
