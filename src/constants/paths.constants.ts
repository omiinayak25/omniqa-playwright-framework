/**
 * --------------------------------------------------------
 * File: paths.constants.ts
 * Module: Constants
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Filesystem path constants (storage-state auth files, etc.) used to persist
 * and reuse authenticated browser sessions across projects.
 *
 * Responsibilities:
 * - Resolve the auth directory and per-app storage-state file locations.
 *
 * Used By:
 * The Playwright `setup` project (writes sessions) and specs (reuse sessions).
 *
 * Dependencies:
 * node:path (path resolution).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Lives in `src/` (NOT a test file) so both the setup project and specs can
 * import it — Playwright forbids importing one test file from another.
 * --------------------------------------------------------
 */
import * as path from 'node:path';

/** Absolute directory where storage-state auth files are written/read. */
export const AUTH_DIR = path.resolve(process.cwd(), '.auth');

/** Stored SauceDemo session (written by the `setup` project). */
export const SAUCE_AUTH_FILE = path.join(AUTH_DIR, 'saucedemo.json');

/** Stored OrangeHRM session (written by the `setup` project). */
export const ORANGE_AUTH_FILE = path.join(AUTH_DIR, 'orangehrm.json');

/** Root directory for all generated reports (Allure, HTML, JUnit, a11y, ...). */
export const REPORTS_DIR = path.resolve(process.cwd(), 'reports');

/** Directory where accessibility (axe-core) scan artifacts are written. */
export const A11Y_REPORT_DIR = path.join(REPORTS_DIR, 'accessibility');

/** Directory where performance (timing/Lighthouse) artifacts are written. */
export const PERF_REPORT_DIR = path.join(REPORTS_DIR, 'performance');
