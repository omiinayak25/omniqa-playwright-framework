/**
 * --------------------------------------------------------
 * File: builder.ts
 * Module: Builders
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Generic, fluent base for the Builder pattern. Concrete builders seed a valid
 * default object, expose chainable `withX()` mutators, and call `build()` to get
 * an immutable copy. Centralises the chaining/override/immutability mechanics so
 * each domain builder only declares its fields and variants.
 *
 * Responsibilities:
 * - Hold a working draft seeded by the concrete builder.
 * - Provide a generic `with()` override escape hatch and an immutable `build()`.
 *
 * Used By:
 * @builders/* (BookingBuilder, EmployeeBuilder, CheckoutBuilder, ProductBuilder)
 * and, transitively, @factories/* for bulk/dataset generation.
 *
 * Dependencies:
 * none (pure TypeScript).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Builders model ONE object fluently; bulk/dataset generation is the Factory
 * layer's job (composition over duplication). `build()` returns a shallow copy
 * so a single builder instance can safely produce multiple snapshots.
 * --------------------------------------------------------
 */

/**
 * Base class for all domain builders.
 *
 * @typeParam T - The object shape the builder produces (a domain model).
 */
export abstract class AbstractBuilder<T extends object> {
  protected draft: T;

  /**
   * @param seed - A fully-populated, valid default object for this type.
   */
  protected constructor(seed: T) {
    this.draft = { ...seed };
  }

  /**
   * Merge arbitrary field overrides onto the draft (one-off escape hatch).
   * @param overrides - Partial set of fields to override.
   * @returns this (for chaining).
   */
  public with(overrides: Partial<T>): this {
    this.draft = { ...this.draft, ...overrides };
    return this;
  }

  /**
   * Produce an immutable snapshot of the current draft.
   * @returns A shallow copy of the built object.
   */
  public build(): T {
    return { ...this.draft };
  }
}
