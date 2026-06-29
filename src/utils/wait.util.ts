/**
 * --------------------------------------------------------
 * File: wait.util.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Waiting / polling helpers for NON-UI conditions — hard sleep and an
 * async predicate poller that fails loud on timeout.
 *
 * Responsibilities:
 * - `sleep(ms)`: a hard delay for the rare case nothing can be awaited.
 * - `pollUntil(predicate, options)`: poll until true or timeout, throwing
 *   a descriptive error (including the last predicate error) on timeout.
 *
 * Used By:
 * API/DB eventual-consistency checks, async predicate waits in tests/helpers.
 *
 * Dependencies:
 * @constants/timeouts.constants
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: some conditions (API/DB consistency, async predicates) have no
 * web-first locator to await. WHEN: use `pollUntil` for those; for UI prefer
 * Playwright's built-in auto-waiting. LIMITATIONS: `sleep()` is flaky in UI
 * flows — avoid it there; `pollUntil` swallows predicate errors until the
 * deadline and only surfaces the last one on timeout.
 * --------------------------------------------------------
 */
import { TIMEOUTS } from '@constants/timeouts.constants';

/**
 * Hard sleep. Use sparingly — only when there is genuinely nothing to await.
 *
 * @param ms - Milliseconds to wait.
 * @returns A promise that resolves after `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface PollOptions {
  /** Total time budget before giving up. */
  readonly timeoutMs?: number;
  /** Delay between polls. */
  readonly intervalMs?: number;
  /** Message used in the timeout error. */
  readonly message?: string;
}

/**
 * Poll an async predicate until it returns true or the timeout elapses.
 * Throws a descriptive error on timeout (fail loud, not silent). Errors
 * thrown by the predicate are swallowed until the deadline, then the last
 * one is appended to the timeout message.
 *
 * @param predicate - Sync or async condition; polling stops when it returns true.
 * @param options - Optional `timeoutMs`, `intervalMs`, and `message`.
 * @returns A promise that resolves once the predicate is satisfied.
 * @throws {Error} If the condition is not met before `timeoutMs` elapses.
 * @example
 *   await pollUntil(async () => (await getOrderStatus(id)) === 'CONFIRMED', {
 *     timeoutMs: 10_000,
 *     message: 'Order never reached CONFIRMED',
 *   });
 */
export async function pollUntil(
  predicate: () => Promise<boolean> | boolean,
  options: PollOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? TIMEOUTS.MEDIUM;
  const intervalMs = options.intervalMs ?? 500;
  const deadline = Date.now() + timeoutMs;

  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return;
    } catch (error: unknown) {
      lastError = error; // swallow until deadline; surface if we time out
    }
    await sleep(intervalMs);
  }

  const base = options.message ?? `Condition not met within ${timeoutMs}ms`;
  const cause = lastError instanceof Error ? ` (last error: ${lastError.message})` : '';
  throw new Error(`[pollUntil] ${base}${cause}`);
}
