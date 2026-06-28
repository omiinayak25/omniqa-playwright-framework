/**
 * --------------------------------------------------------
 * File: global-setup.ts
 * Module: Lifecycle Hooks
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Runs ONCE before the entire test run (the default export is wired into
 * playwright.config.ts as `globalSetup`). Framework-level preparation only.
 *
 * Responsibilities:
 * - Ensure all runtime output directories exist before any test writes to them.
 * - Emit Allure metadata (environment.properties + categories.json).
 * - Print a run banner (env, workers, projects, log level) for CI traceability.
 *
 * Used By:
 * playwright.config.ts (globalSetup).
 *
 * Dependencies:
 * @playwright/test (FullConfig), @config/config, @utils/logger,
 * @utils/file.util (ensureDir), @utils/allure-meta.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Storage-state AUTHENTICATION setup (log in once, reuse the session) is the
 * intended place to wire here once the Login page object exists.
 * --------------------------------------------------------
 *
 * HOOK FLOW: global-setup (runs once, before all workers/tests start) → tests
 * execute across workers → global-teardown (runs once, after all tests finish).
 */
import type { FullConfig } from '@playwright/test';
import { config } from '@config/config';
import { logger } from '@utils/logger';
import { ensureDir } from '@utils/file.util';
import { writeAllureMetadata } from '@utils/allure-meta';

const OUTPUT_DIRS = [
  'reports/allure-results',
  'reports/html-report',
  'reports/junit',
  'screenshots',
  'videos',
  'traces',
  'downloads',
  'logs',
];

async function globalSetup(playwrightConfig: FullConfig): Promise<void> {
  OUTPUT_DIRS.forEach((dir) => ensureDir(dir));
  writeAllureMetadata(); // Allure environment.properties + categories.json

  logger.info('════════════════════════════════════════════════════════');
  logger.info(`  TEST RUN START`);
  logger.info(`  Environment : ${config.environment.toUpperCase()}`);
  logger.info(`  Workers     : ${playwrightConfig.workers}`);
  logger.info(`  Projects    : ${playwrightConfig.projects.map((p) => p.name).join(', ')}`);
  logger.info(`  Log level   : ${config.execution.logLevel}`);
  logger.info('════════════════════════════════════════════════════════');
}

export default globalSetup;
