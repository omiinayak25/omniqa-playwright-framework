/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel (re-export) module for the utilities package so callers use a
 * single import path.
 *
 * Responsibilities:
 * - Re-export logger, date, wait, retry, random, file, and crypto utils.
 *
 * Used By:
 * Tests, fixtures, ApiClient, and any code consuming framework utilities.
 *
 * Dependencies:
 * @utils/logger, @utils/date.util, @utils/wait.util, @utils/retry.util,
 * @utils/random.util, @utils/file.util, @utils/crypto.util
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: one import surface keeps consumer imports short and stable. WHEN:
 * import from `@utils/index` for common helpers. LIMITATION: log-context,
 * log-capture, allure-meta, and allure.util are intentionally NOT re-exported
 * here — import those directly where needed.
 *
 * Example:
 *   import { logger, retryAsync, randomEmail, readJson } from '@utils/index';
 * --------------------------------------------------------
 */
export { logger, scopedLogger } from '@utils/logger';
export * from '@utils/date.util';
export * from '@utils/wait.util';
export * from '@utils/retry.util';
export * from '@utils/random.util';
export * from '@utils/file.util';
export * from '@utils/crypto.util';
