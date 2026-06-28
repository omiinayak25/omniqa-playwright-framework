/**
 * --------------------------------------------------------
 * File: log-capture.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Per-test log capture buffers, keyed by correlation id, holding the
 * formatted log lines emitted during a test.
 *
 * Responsibilities:
 * - `beginCapture` / `isCapturing` / `appendCapture` / `endCapture` to
 *   manage an in-memory line buffer per correlation id.
 *
 * Used By:
 * logger's CaptureTransport (appends lines) and the autoLog fixture
 * (begins capture, flushes on failure).
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: on failure the autoLog fixture flushes the buffer into the report
 * (and a per-test failure log file), so a failing test's full execution
 * trace is one click away — no re-running with DEBUG. WHEN: managed by the
 * fixture/transport, not called from tests directly. LIMITATION: buffers
 * live in memory for the worker process; always `endCapture` to free them.
 * --------------------------------------------------------
 */
const buffers = new Map<string, string[]>();

/**
 * Start a fresh capture buffer for a correlation id.
 * @param correlationId - Identifier the buffer is keyed by.
 */
export function beginCapture(correlationId: string): void {
  buffers.set(correlationId, []);
}

/**
 * @param correlationId - Identifier to check.
 * @returns `true` if a capture buffer exists for this correlation id.
 */
export function isCapturing(correlationId: string): boolean {
  return buffers.has(correlationId);
}

/**
 * Append a formatted line to a correlation id's buffer (no-op if absent).
 * @param correlationId - Identifier of the target buffer.
 * @param line - Pre-formatted log line to store.
 */
export function appendCapture(correlationId: string, line: string): void {
  buffers.get(correlationId)?.push(line);
}

/**
 * Return and clear the captured lines for a correlation id.
 *
 * @param correlationId - Identifier of the buffer to drain.
 * @returns The captured lines (empty array if none); the buffer is removed.
 */
export function endCapture(correlationId: string): string[] {
  const lines = buffers.get(correlationId) ?? [];
  buffers.delete(correlationId);
  return lines;
}
