/**
 * --------------------------------------------------------
 * File: allure-meta.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Generate Allure report metadata files so every report is self-describing.
 *
 * Responsibilities:
 * - `writeAllureEnvironment`: write `environment.properties` (the
 *   "Environment" widget — env, URLs, DB, Node/OS, headless).
 * - `writeAllureCategories`: write `categories.json` (defect bucketing).
 * - `writeAllureMetadata`: write both in one call.
 *
 * Used By:
 * Global setup (Playwright `globalSetup`), run once before the suite.
 *
 * Dependencies:
 * node:os, node:path, node:fs, @config/config, @utils/file.util
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: Allure reads `environment.properties` and `categories.json` from the
 * results directory at generation time to populate the Environment widget
 * and auto-bucket failures (product vs infrastructure vs skipped).
 * WHEN: call once at global setup. LIMITATION: overwrites existing files in
 * `reports/allure-results`; values come from validated config.
 * --------------------------------------------------------
 */
import * as os from 'node:os';
import * as path from 'node:path';
import { config } from '@config/config';
import { writeJson, ensureDir } from '@utils/file.util';
import * as fs from 'node:fs';

const RESULTS_DIR = path.resolve(process.cwd(), 'reports', 'allure-results');

/**
 * Write the Allure "Environment" widget data (`environment.properties`).
 * Captures the environment, app/API URLs, database, Node/OS, and headless
 * flag so the report records exactly what was tested.
 */
export function writeAllureEnvironment(): void {
  ensureDir(RESULTS_DIR);
  const lines = [
    `Environment=${config.environment.toUpperCase()}`,
    `SauceDemo.URL=${config.ui.sauceDemo.baseUrl}`,
    `OrangeHRM.URL=${config.ui.orangeHrm.baseUrl}`,
    `RestfulBooker.URL=${config.api.restfulBooker.baseUrl}`,
    `Database=${config.database.host}:${config.database.port}/${config.database.database}`,
    `Node=${process.version}`,
    `OS=${os.type()} ${os.release()}`,
    `Headless=${config.execution.headless}`,
  ];
  fs.writeFileSync(path.join(RESULTS_DIR, 'environment.properties'), lines.join('\n'), 'utf-8');
}

/**
 * Write Allure defect categories (`categories.json`) so failures are
 * auto-bucketed into product defects, infrastructure/timeouts, and skipped.
 */
export function writeAllureCategories(): void {
  ensureDir(RESULTS_DIR);
  const categories = [
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*(expect|assert).*',
    },
    {
      name: 'Test infrastructure / timeouts',
      matchedStatuses: ['broken', 'failed'],
      messageRegex: '.*(Timeout|ECONNREFUSED|ENOTFOUND|navigation).*',
    },
    {
      name: 'Ignored / skipped (gated)',
      matchedStatuses: ['skipped'],
    },
  ];
  writeJson(path.join(RESULTS_DIR, 'categories.json'), categories);
}

/**
 * Convenience: write all Allure metadata (environment + categories).
 */
export function writeAllureMetadata(): void {
  writeAllureEnvironment();
  writeAllureCategories();
}
