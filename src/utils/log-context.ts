/**
 * --------------------------------------------------------
 * File: log-context.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Per-test log context — carries a correlation id (and test name) so the
 * logger can tag every API/DB/browser line with the test it belongs to.
 *
 * Responsibilities:
 * - Hold the module-scoped "current" LogContext (set/get/clear).
 * - `currentCorrelationId()` for transports/capture keying.
 * - `runWithLogContext()` to run a function within a nested context.
 *
 * Used By:
 * logger (injectContext format, CaptureTransport) and the autoLog fixture.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY (design): Playwright runs tests ONE AT A TIME within a worker process
 * (parallelism is across worker processes), so a module-scoped "current
 * context" is safe — no two tests interleave in one process. This is simpler
 * and MORE reliable than AsyncLocalStorage, which does not propagate cleanly
 * across Playwright's fixture `use()` boundary. LIMITATION: relies on that
 * single-test-per-process model; do not share this module across processes.
 * --------------------------------------------------------
 */
export interface LogContext {
  readonly correlationId: string;
  readonly testName?: string;
}

let current: LogContext | undefined;

/**
 * Set (or clear) the active log context for this process.
 * @param context - The context to activate, or `undefined` to clear it.
 */
export function setLogContext(context: LogContext | undefined): void {
  current = context;
}

/**
 * @returns The currently active log context, or `undefined` if none.
 */
export function getLogContext(): LogContext | undefined {
  return current;
}

/**
 * @returns The active correlation id, or `undefined` if no context is set.
 */
export function currentCorrelationId(): string | undefined {
  return current?.correlationId;
}

/**
 * Run `fn` with `context` active, restoring the previous context afterward
 * (supports nesting). Use for explicit scopes (e.g. BDD steps); the autoLog
 * fixture uses set/clear directly around the test body.
 *
 * @typeParam T - Resolved value type of `fn`.
 * @param context - The log context to make active for the duration of `fn`.
 * @param fn - The async function to run within `context`.
 * @returns The resolved value of `fn`; the previous context is always restored.
 * @example
 *   await runWithLogContext({ correlationId: id, testName: 'login' }, async () => {
 *     await doApiCall(); // every log line is tagged with this correlation id
 *   });
 */
export async function runWithLogContext<T>(context: LogContext, fn: () => Promise<T>): Promise<T> {
  const previous = current;
  current = context;
  try {
    return await fn();
  } finally {
    current = previous;
  }
}
