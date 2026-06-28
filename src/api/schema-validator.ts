/**
 * --------------------------------------------------------
 * File: schema-validator.ts
 * Module: API Validation
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * JSON Schema validation utility (contract testing) backed by AJV. Compiles
 * schemas on first use and caches the compiled validators so repeated checks
 * across a suite stay fast.
 *
 * Responsibilities:
 * - Maintain a single shared, configured AJV instance per process
 * - Compile + cache validators keyed by schema identity
 * - Validate arbitrary data against a JSON schema
 * - Flatten AJV errors into readable, path-prefixed messages
 *
 * Used By:
 * ResponseValidator.matchesSchema(), tests/api/* contract suites
 *
 * Dependencies:
 * ajv (Ajv, ValidateFunction, ErrorObject), ajv-formats
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Module-level AJV instance + cache act as Singleton-ish process state.
 * `allErrors` reports every failure; `strict: false` tolerates loose schemas.
 * --------------------------------------------------------
 */
import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

// One configured AJV instance shared process-wide: collect all errors per run
// and run non-strict so permissive/partial schemas don't throw on compile.
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Compiled-validator cache keyed by the schema's serialized form, so the same
// schema is compiled only once across the whole test run.
const cache = new Map<string, ValidateFunction>();

export interface SchemaResult {
  readonly valid: boolean;
  readonly errors: string[];
}

/**
 * Validate `data` against a JSON schema, compiling and caching by schema identity.
 *
 * @param schema JSON schema to validate against.
 * @param data Arbitrary value (typically a response body) to check.
 * @returns SchemaResult with `valid` and a list of human-readable `errors`.
 * @example
 *   const { valid, errors } = validateSchema(BOOKING_SCHEMA, res.body);
 */
export function validateSchema(schema: object, data: unknown): SchemaResult {
  // Serialized schema is the cache key — identical schemas reuse one validator.
  const key = JSON.stringify(schema);
  let validate = cache.get(key);
  if (validate === undefined) {
    validate = ajv.compile(schema);
    cache.set(key, validate);
  }
  const valid = validate(data) as boolean;
  const errors = (validate.errors ?? []).map(
    (e: ErrorObject) => `${e.instancePath || '(root)'} ${e.message ?? 'invalid'}`,
  );
  return { valid, errors };
}
