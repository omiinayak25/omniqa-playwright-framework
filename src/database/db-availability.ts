/**
 * --------------------------------------------------------
 * File: db-availability.ts
 * Module: Database Access
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Probe whether a PostgreSQL instance is reachable so DB-dependent specs can
 * skip gracefully instead of failing the whole suite when no DB is provisioned.
 *
 * Responsibilities:
 * - Run a lightweight `SELECT 1` health check against the shared pool.
 * - Cache the result so the probe runs at most once per process.
 *
 * Used By:
 * tests/db/* (test.skip guards), db.fixtures.ts
 *
 * Dependencies:
 * @database/db-pool (getPool), @utils/logger
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Result is memoized — repeated calls do not re-hit the database.
 * --------------------------------------------------------
 */
import { getPool } from '@database/db-pool';
import { scopedLogger } from '@utils/logger';

const log = scopedLogger('DbAvailability');
let cached: boolean | undefined;

/**
 * Check whether the configured database is reachable.
 *
 * Purpose: Tell callers (typically test.skip guards) if Postgres can be hit,
 * so DB specs skip cleanly when it is absent rather than erroring.
 *
 * @returns `true` if a `SELECT 1` succeeds within the connection timeout,
 *          otherwise `false`. The first call performs the probe; later calls
 *          return the cached result.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  // Memoize: only probe the DB once per process, then reuse the verdict.
  if (cached !== undefined) return cached;
  try {
    await getPool().query('SELECT 1');
    cached = true;
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    log.warn(`Database not reachable — DB tests will skip: ${reason}`);
    cached = false;
  }
  return cached;
}
