/**
 * --------------------------------------------------------
 * File: factory.ts
 * Module: Factories
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Shared bulk-generation primitive for the Factory layer. Factories own
 * dataset/bulk/positive-negative-edge generation; this helper removes the
 * repeated `Array.from(...)` boilerplate so each factory stays declarative.
 *
 * Used By:
 * @factories/* (booking, employee, product, user, test-data).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */

/**
 * Generate `count` items by invoking `make` with each index.
 * @typeParam T - Item type produced.
 * @param count - Number of items to generate (>= 0).
 * @param make - Producer called per index.
 * @returns An array of `count` generated items.
 */
export function generate<T>(count: number, make: (index: number) => T): T[] {
  return Array.from({ length: Math.max(0, count) }, (_unused, index) => make(index));
}
