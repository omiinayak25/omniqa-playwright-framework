/**
 * --------------------------------------------------------
 * File: db-pool.ts
 * Module: Database Access
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Owns the single, process-wide PostgreSQL connection pool used by every DB
 * test, repository, and assertion helper.
 *
 * Responsibilities:
 * - Build a pg PoolConfig from the framework config (host, creds, SSL, limits).
 * - Lazily create and return one shared Pool (Singleton) per process.
 * - Tear the pool down cleanly in global teardown.
 *
 * Used By:
 * tests/db/*, db.fixtures.ts, QueryRunner, db-availability, repositories
 *
 * Dependencies:
 * pg Pool/PoolConfig, @config/config, @utils/logger
 *
 * Last Updated: 2026-06-27
 * Notes:
 * One pool per process — connections are reused across queries rather than
 * opened per query, which is far cheaper and avoids exhausting the DB.
 * --------------------------------------------------------
 */
import { Pool, type PoolConfig } from 'pg';
import { config } from '@config/config';
import { scopedLogger } from '@utils/logger';

const log = scopedLogger('DbPool');
let pool: Pool | undefined;

function buildPoolConfig(): PoolConfig {
  const db = config.database;
  return {
    host: db.host,
    port: db.port,
    database: db.database,
    user: db.user,
    password: db.password,
    max: db.poolMax,
    idleTimeoutMillis: db.idleTimeoutMs,
    connectionTimeoutMillis: 5_000,
    ssl: db.ssl ? { rejectUnauthorized: false } : undefined,
  };
}

/**
 * Get (or lazily create) the shared connection pool.
 *
 * Purpose: Return the one Singleton pool, creating it on first call so a fresh
 * process pays the setup cost only once. Subsequent calls reuse the same pool.
 *
 * @returns The shared pg {@link Pool} instance.
 */
export function getPool(): Pool {
  // Lazy Singleton: create the pool once, then reuse it for the process lifetime.
  if (pool === undefined) {
    pool = new Pool(buildPoolConfig());
    pool.on('error', (err) => log.error(`Idle client error: ${err.message}`));
    log.info(
      `Pool created → ${config.database.user}@${config.database.host}:${config.database.port}/${config.database.database}`,
    );
  }
  return pool;
}

/**
 * Close the shared pool and release all its connections.
 *
 * Purpose: Drain the pool at global teardown so the process can exit cleanly
 * (no lingering open sockets). Resets the Singleton so a later getPool() can
 * recreate it if needed.
 *
 * @returns Resolves once every pooled connection has been ended.
 */
export async function closePool(): Promise<void> {
  if (pool !== undefined) {
    await pool.end();
    pool = undefined;
    log.info('Pool closed');
  }
}
