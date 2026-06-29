/**
 * --------------------------------------------------------
 * File: retry.util.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Generic async retry with exponential backoff for transient failures.
 *
 * Responsibilities:
 * - `retryAsync(fn, options)`: re-run an async operation on failure with a
 *   growing delay (delayMs * backoffFactor each attempt), honoring an
 *   optional `retryOn` predicate; re-throws the last error if all fail.
 *
 * Used By:
 * ApiClient (transient 5xx / network errors) and any idempotent operation
 * that may fail intermittently.
 *
 * Dependencies:
 * @utils/logger, @utils/wait.util
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: networks and services flap; blind retries hide bugs, so retries are
 * opt-in per error via `retryOn`. WHEN: wrap idempotent calls that can fail
 * transiently. LIMITATIONS: do NOT use for assertions or non-idempotent
 * writes; exponential backoff means total wait grows quickly with `retries`.
 * Defaults: 3 attempts, 500ms initial delay, x2 backoff, retry-on-any.
 * --------------------------------------------------------
 */
import { logger } from '@utils/logger';
import { sleep } from '@utils/wait.util';

export interface RetryOptions {
  /** Max attempts (including the first). Default 3. */
  readonly retries?: number;
  /** Initial delay before the first retry (ms). Default 500. */
  readonly delayMs?: number;
  /** Multiplier applied to the delay after each attempt. Default 2. */
  readonly backoffFactor?: number;
  /** Predicate deciding whether a given error is retryable. Default: always. */
  readonly retryOn?: (error: unknown) => boolean;
  /** Label for logs. */
  readonly label?: string;
}

/**
 * Execute `fn`, retrying on failure with exponential backoff.
 * Re-throws the last error if all attempts fail.
 *
 * @typeParam T - Resolved value type of the operation.
 * @param fn - The async operation to (re)execute.
 * @param options - Retry tuning: `retries`, `delayMs`, `backoffFactor`,
 *   `retryOn` predicate, and `label` for logs.
 * @returns The resolved value of the first successful attempt.
 * @throws {Error} A wrapped error if every attempt fails or `retryOn` returns false.
 * @example
 *   const res = await retryAsync(() => api.get('/booking/1'), {
 *     retries: 4,
 *     retryOn: (e) => isTransient(e),
 *     label: 'GET /booking/1',
 *   });
 */
export async function retryAsync<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  const backoffFactor = options.backoffFactor ?? 2;
  const retryOn = options.retryOn ?? ((): boolean => true);
  const label = options.label ?? 'operation';
  let delay = options.delayMs ?? 500;

  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const isLast = attempt === retries;
      if (isLast || !retryOn(error)) break;

      const reason = error instanceof Error ? error.message : String(error);
      logger.warn(
        `[retry] "${label}" attempt ${attempt}/${retries} failed: ${reason}. Retrying in ${delay}ms`,
      );
      await sleep(delay);
      delay *= backoffFactor;
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`[retry] "${label}" failed after ${retries} attempt(s): ${reason}`);
}
