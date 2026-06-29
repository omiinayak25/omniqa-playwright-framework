/**
 * --------------------------------------------------------
 * File: global-teardown.ts
 * Module: Lifecycle Hooks
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Runs ONCE after the entire test run (wired into playwright.config.ts as
 * `globalTeardown`). Releases shared process-wide resources.
 *
 * Responsibilities:
 * - Close the shared DB connection pool (no-op if it was never opened).
 * - Emit a closing run banner.
 *
 * Used By:
 * playwright.config.ts (globalTeardown).
 *
 * Dependencies:
 * @utils/logger, @database/db-pool (closePool).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Counterpart to global-setup — together they bracket the whole run.
 * --------------------------------------------------------
 *
 * HOOK FLOW: global-setup (once, before run) → tests → global-teardown (here,
 * once, after run) closes shared resources opened across the run.
 */
import { logger } from '@utils/logger';
import { closePool } from '@database/db-pool';

async function globalTeardown(): Promise<void> {
  await closePool(); // release DB connections (no-op if pool never opened)
  logger.info('════════════════════════════════════════════════════════');
  logger.info('  TEST RUN COMPLETE');
  logger.info('════════════════════════════════════════════════════════');
}

export default globalTeardown;
