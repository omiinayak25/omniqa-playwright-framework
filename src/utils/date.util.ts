/**
 * --------------------------------------------------------
 * File: date.util.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Date & time helper functions for timestamps, filesystem-safe names,
 * date arithmetic, and human-readable durations.
 *
 * Responsibilities:
 * - Produce ISO-8601 / epoch / YYYY-MM-DD timestamps.
 * - Build filesystem-safe timestamps for artifact naming.
 * - Add/subtract days and format millisecond durations for logs.
 *
 * Used By:
 * Screenshot/download naming, report folders, API date fields, timing logs.
 *
 * Dependencies:
 * None — native JavaScript Date only.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: pure functions over native Date keep dependencies lean — no external
 * date library is needed for test concerns. WHEN: use for naming artifacts,
 * formatting API date fields, and pretty-printing elapsed time.
 * LIMITATIONS: no timezone/locale handling beyond UTC ISO output; not a
 * substitute for a full date library if complex calendar math is needed.
 * --------------------------------------------------------
 */

/**
 * Current time as ISO-8601 string.
 * @returns The current instant formatted as an ISO-8601 UTC string.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Unix epoch milliseconds.
 * @returns Milliseconds elapsed since the Unix epoch (`Date.now()`).
 */
export function nowEpochMs(): number {
  return Date.now();
}

/**
 * Filesystem-safe timestamp (no `:` / `.`), e.g. `2026-06-27_14-05-09-123`.
 * Useful for naming screenshots, downloads, and report folders.
 *
 * @param date - Date to format. Defaults to now.
 * @returns A path-safe timestamp string with `:`/`.` replaced by `-`.
 */
export function fileTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
}

/**
 * Add `days` to a date (negative subtracts). Returns a NEW Date.
 *
 * @param date - Base date (not mutated).
 * @param days - Number of days to add; negative values subtract.
 * @returns A new `Date` offset by `days` from `date`.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format a date as `YYYY-MM-DD` (common for API date fields).
 *
 * @param date - Date to format. Defaults to now.
 * @returns The UTC date portion as `YYYY-MM-DD`.
 */
export function toYmd(date: Date = new Date()): string {
  const iso = date.toISOString();
  return iso.slice(0, 10);
}

/**
 * Human-friendly elapsed string from a millisecond duration.
 *
 * @param ms - Duration in milliseconds.
 * @returns `<n>ms`, `<n>s`, or `<m>m <s>s` depending on magnitude.
 */
export function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  const seconds = ms / 1_000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remSeconds}s`;
}
