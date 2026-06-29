/**
 * --------------------------------------------------------
 * File: environment.helper.ts
 * Module: Helpers
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Cross-cutting execution-environment queries that ORCHESTRATE existing config
 * and env accessors — answering "which env / CI? / slow-mo? / a one-line
 * summary" in one place, instead of scattering raw process.env reads.
 *
 * Responsibilities:
 * - Resolve active environment, CI flag, and slow-motion delay.
 * - Produce a single human-readable run descriptor (used in banners/logs).
 *
 * Used By:
 * @helpers/browser.helper (slowMoMs), src/hooks/global-setup (describe()).
 *
 * Dependencies:
 * @config/config (resolved config), @config/env (typed accessors).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Coordinates existing accessors; it does NOT re-parse or duplicate them.
 * --------------------------------------------------------
 */
import { config } from '@config/config';
import { getEnvBoolean, getEnvNumber, type AppEnvironment } from '@config/env';
import type { ExecutionContext } from '@apptypes/index';

/** Read-only orchestration over execution-environment configuration. */
export class EnvironmentHelper {
  /** Active target environment (dev | qa | uat | staging | production). */
  public static current(): AppEnvironment {
    return config.environment;
  }

  /** Whether the run is in CI (drives retries/workers elsewhere). */
  public static isCi(): boolean {
    return getEnvBoolean('CI', false);
  }

  /** Slow-motion delay (ms) between actions; 0 unless SLOWMO_MS is set. */
  public static slowMoMs(): number {
    return getEnvNumber('SLOWMO_MS', 0);
  }

  /** Immutable snapshot of how this run is configured. */
  public static context(): ExecutionContext {
    return {
      environment: EnvironmentHelper.current(),
      browser: 'chromium',
      ci: EnvironmentHelper.isCi(),
      headless: config.execution.headless,
      slowMoMs: EnvironmentHelper.slowMoMs(),
    };
  }

  /** One-line run descriptor for banners/logs (derived from the snapshot). */
  public static describe(): string {
    const c = EnvironmentHelper.context();
    return `env=${c.environment} ci=${c.ci} headless=${c.headless} slowMo=${c.slowMoMs}ms browser=${c.browser}`;
  }
}
