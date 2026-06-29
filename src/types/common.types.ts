/**
 * --------------------------------------------------------
 * File: common.types.ts
 * Module: Types
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Small, cross-cutting TypeScript primitives reused across layers — a generic
 * optional, a recursive deep-immutable mapped type, and a generic
 * success/failure discriminated union. These are utilities, NOT domain models
 * (no duplication with @models).
 *
 * Used By:
 * @repositories (Maybe), @types/execution.types (DeepReadonly),
 * @helpers/storage-state.helper (Result).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */

/** A value that may be present, null, or undefined (generic utility). */
export type Maybe<T> = T | null | undefined;

/** Recursively make every property (and array element) readonly (mapped type). */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T[K] extends object
      ? DeepReadonly<T[K]>
      : T[K];
};

/**
 * Generic success/failure result (discriminated union on `ok`). Lets callers
 * branch exhaustively without exceptions.
 * @typeParam T - Success value type.
 * @typeParam E - Failure value type (defaults to string).
 */
export type Result<T, E = string> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };
