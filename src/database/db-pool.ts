/**
 * --------------------------------------------------------
 * File: db-pool.ts
 * Module: Database Access
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Owns the single, process-wide database connection used by every DB test,
 * repository, and assertion helper. Backed by PGlite — an embedded PostgreSQL
 * that runs entirely in-process (WebAssembly), so NO external database server,
 * Docker, or install is required. The data lives in memory and is recreated
 * (schema + seed) fresh for each process from scripts/db/schema.sql.
 *
 * Responsibilities:
 * - Lazily create one shared PGlite instance (Singleton) per process.
 * - Apply the schema + seed once, on first use.
 * - Expose a minimal pg.Pool-compatible surface (query / connect / end) so the
 *   rest of the framework (QueryRunner, repositories, assertions) is unchanged.
 * - Tear the instance down cleanly in global teardown.
 *
 * Used By:
 * tests/db/*, db.fixtures.ts, QueryRunner, db-availability, repositories
 *
 * Dependencies:
 * @electric-sql/pglite (PGlite), node:fs, node:path, @utils/logger
 *
 * Last Updated: 2026-06-28
 * Notes:
 * PGlite is a single in-process connection (not a TCP pool). The adapter below
 * makes it look like a pg Pool: `connect()` returns a lightweight client whose
 * `release()` is a no-op, and transactions work via BEGIN/COMMIT/ROLLBACK on
 * that one connection. Because each Playwright worker is its own process, every
 * worker gets an isolated, freshly-seeded database — great for test isolation.
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import type { Pool } from 'pg';
import { scopedLogger } from '@utils/logger';

const log = scopedLogger('DbPool');

// schema.sql lives at <repo>/scripts/db/schema.sql; this file is at
// <repo>/src/database/db-pool.ts, so go up two levels.
const SCHEMA_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'db', 'schema.sql');

/** Shape the QueryRunner relies on from a pg query result. */
interface QueryResultLike {
  rows: unknown[];
  rowCount: number;
}

/** Minimal pg.PoolClient-compatible surface used by QueryRunner.transaction. */
interface ClientLike {
  query(sql: string, params?: ReadonlyArray<unknown>): Promise<QueryResultLike>;
  release(): void;
}

/**
 * Adapts an embedded PGlite instance to the slice of the pg.Pool API the
 * framework actually uses (`query`, `connect`, `end`). Schema + seed are
 * applied exactly once, lazily, before the first query resolves.
 */
class PglitePool {
  private readonly db: PGlite;
  private readonly ready: Promise<void>;

  constructor() {
    this.db = new PGlite(); // in-memory; pass a path here to persist to disk
    this.ready = this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.db.waitReady;
    const raw = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    // PGlite has a single built-in superuser and no `automation_user` role, so
    // strip the SET ROLE / RESET ROLE statements. They stay in schema.sql for
    // the real-PostgreSQL / CI path (which owns objects via that role).
    const sql = raw.replace(/^[ \t]*(?:SET ROLE|RESET ROLE)\b[^;]*;[ \t]*$/gim, '');
    await this.db.exec(sql);
    log.info('PGlite embedded database ready (schema + seed applied)');
  }

  /** Run a parameterized query (`$1, $2 …`) and return rows + affected count. */
  public async query<T = unknown>(
    sql: string,
    params: ReadonlyArray<unknown> = [],
  ): Promise<QueryResultLike> {
    await this.ready;
    const result = await this.db.query<T>(sql, params as unknown[]);
    return {
      rows: result.rows as unknown[],
      rowCount: result.affectedRows ?? result.rows.length,
    };
  }

  /**
   * Return a client bound to the single underlying connection. `release()` is a
   * no-op because PGlite is not a multi-connection pool; transactions issue
   * BEGIN/COMMIT/ROLLBACK as plain statements on this same connection.
   */
  public async connect(): Promise<ClientLike> {
    await this.ready;
    return {
      query: (sql: string, params: ReadonlyArray<unknown> = []) => this.query(sql, params),
      release: () => {
        /* no-op: single in-process connection */
      },
    };
  }

  /** Close the embedded database and release its resources. */
  public async end(): Promise<void> {
    await this.db.close();
  }
}

let pool: PglitePool | undefined;

/**
 * Get (or lazily create) the shared embedded database "pool".
 *
 * Purpose: Return the one Singleton PGlite-backed pool, creating it on first
 * call so a fresh process pays the setup (and schema apply) cost only once.
 *
 * @returns The shared pool, typed as a pg {@link Pool} for drop-in
 *          compatibility with the existing QueryRunner / repositories.
 */
export function getPool(): Pool {
  // Lazy Singleton: create the embedded DB once, then reuse it for the process.
  if (pool === undefined) {
    pool = new PglitePool();
    log.info('PGlite pool created (embedded PostgreSQL — no server required)');
  }
  // The adapter implements the subset of pg.Pool the framework uses; the cast
  // keeps QueryRunner/repositories unchanged while swapping the engine.
  return pool as unknown as Pool;
}

/**
 * Close the shared embedded database.
 *
 * Purpose: Drain resources at global teardown so the process exits cleanly.
 * Resets the Singleton so a later getPool() can recreate it if needed.
 *
 * @returns Resolves once the embedded database has been closed.
 */
export async function closePool(): Promise<void> {
  if (pool !== undefined) {
    await pool.end();
    pool = undefined;
    log.info('Pool closed');
  }
}
