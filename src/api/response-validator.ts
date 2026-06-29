/**
 * --------------------------------------------------------
 * File: response-validator.ts
 * Module: API Validation
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Fluent, composable assertion helper for an ApiResponse. Provides chainable
 * checks (status, timing, schema, headers) that throw descriptive errors so
 * Playwright reports failures with actionable context.
 *
 * Responsibilities:
 * - Assert HTTP status (exact or 2xx)
 * - Assert response time stays under a performance threshold
 * - Assert the body conforms to a JSON schema (contract testing)
 * - Assert header presence/value
 * - Expose the typed body for custom, test-specific assertions
 *
 * Used By:
 * tests/api/*, contract test suites, E2E specs
 *
 * Dependencies:
 * validateSchema (@api/schema-validator), ApiResponse model, HttpStatus constants
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Validation-layer only — separate from ApiClient (transport) and service
 * classes (business). Each method returns `this` for fluent chaining, e.g.:
 *   ResponseValidator.for(res).status(200).maxTime(2000).matchesSchema(S);
 * --------------------------------------------------------
 */
import { validateSchema } from '@api/schema-validator';
import type { ApiResponse } from '@models/api.model';
import type { HttpStatus } from '@constants/http.constants';

/**
 * ResponseValidator
 *
 * Validation-layer wrapper around a single ApiResponse. Exists so tests can
 * express expectations declaratively and consistently without re-implementing
 * status/timing/schema checks. SRP: it only asserts — it never performs I/O
 * (ApiClient) and holds no business logic (service classes). Construction is
 * private; use the static `for` factory.
 */
export class ResponseValidator<T> {
  private constructor(private readonly response: ApiResponse<T>) {}

  /**
   * Factory entry point for the fluent chain.
   * @param response The response to validate.
   * @returns A new ResponseValidator bound to `response`.
   */
  public static for<T>(response: ApiResponse<T>): ResponseValidator<T> {
    return new ResponseValidator<T>(response);
  }

  /**
   * Assert the response carries an exact HTTP status code.
   * @param expected Expected status (HttpStatus enum or raw number).
   * @returns `this` for chaining.
   * @throws Error (with a truncated body excerpt) when the status differs.
   */
  public status(expected: HttpStatus | number): this {
    if (this.response.status !== expected) {
      throw new Error(
        `Expected status ${expected} but got ${this.response.status}. Body: ${JSON.stringify(
          this.response.body,
        ).slice(0, 300)}`,
      );
    }
    return this;
  }

  /**
   * Assert the response status is in the 2xx success range.
   * @returns `this` for chaining.
   * @throws Error when the status is not 2xx.
   */
  public ok(): this {
    if (!this.response.ok) {
      throw new Error(`Expected a 2xx status but got ${this.response.status}`);
    }
    return this;
  }

  /**
   * Assert the measured response time stays under a threshold (perf smoke).
   * @param maxMs Maximum allowed response time in milliseconds.
   * @returns `this` for chaining.
   * @throws Error when the response exceeded `maxMs`.
   */
  public maxTime(maxMs: number): this {
    if (this.response.responseTimeMs > maxMs) {
      throw new Error(
        `Response took ${this.response.responseTimeMs}ms, exceeding the ${maxMs}ms threshold`,
      );
    }
    return this;
  }

  /**
   * Assert the response body conforms to a JSON schema (contract test).
   * @param schema JSON schema object (e.g. from src/schemas).
   * @returns `this` for chaining.
   * @throws Error listing every AJV validation failure when invalid.
   */
  public matchesSchema(schema: object): this {
    const { valid, errors } = validateSchema(schema, this.response.body);
    if (!valid) {
      throw new Error(`Schema validation failed:\n  - ${errors.join('\n  - ')}`);
    }
    return this;
  }

  /**
   * Assert a response header is present, and optionally equals a value.
   * @param name Header name (matched case-insensitively).
   * @param equals Optional exact value the header must equal.
   * @returns `this` for chaining.
   * @throws Error when the header is missing or its value differs.
   */
  public hasHeader(name: string, equals?: string): this {
    const actual = this.response.headers[name.toLowerCase()];
    if (actual === undefined) throw new Error(`Expected header "${name}" to be present`);
    if (equals !== undefined && actual !== equals) {
      throw new Error(`Expected header "${name}" to equal "${equals}" but got "${actual}"`);
    }
    return this;
  }

  /**
   * Escape hatch to retrieve the typed body for custom, test-specific assertions.
   * @returns The parsed response body typed as T.
   */
  public body(): T {
    return this.response.body;
  }
}
