/**
 * --------------------------------------------------------
 * File: apply-schema.ts
 * Module: Scripts / Database
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Apply scripts/db/schema.sql to a running PostgreSQL instance using the
 * already-bundled `pg` driver — no external `psql` client required. Used by
 * CI (the GitHub Actions Postgres *service* container does not auto-run
 * init scripts) and any host that lacks the local provision.sh path.
 *
 * Responsibilities:
 * - Read schema.sql (sibling file) and execute it as one batch.
 * - Connect using DB_* environment variables (with sensible defaults).
 *
 * Used By:
 * `npm run db:schema`; .github/workflows/ci.yml (test job).
 *
 * Dependencies:
 * pg (Client), node:fs, node:path.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Reads process.env DIRECTLY (not @config/config) so it stays standalone and
 * runnable without the full framework configuration being present. node-pg
 * runs the whole multi-statement, dollar-quoted script in a single simple
 * query — exactly what schema.sql needs.
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Client } from 'pg';

async function applySchema(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  const client = new Client({
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_PORT'] ?? '5432'),
    database: process.env['DB_NAME'] ?? 'automation_db',
    user: process.env['DB_USER'] ?? 'automation_user',
    password: process.env['DB_PASSWORD'] ?? '',
  });

  await client.connect();
  try {
    await client.query(sql);
    process.stdout.write('✓ Schema applied successfully\n');
  } finally {
    await client.end();
  }
}

applySchema().catch((error: unknown) => {
  process.stderr.write(`✘ Schema apply failed: ${(error as Error).message}\n`);
  process.exit(1);
});
