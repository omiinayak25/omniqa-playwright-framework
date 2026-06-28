/**
 * --------------------------------------------------------
 * File: execution.types.ts
 * Module: Types
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Shared execution-environment types: a friendly alias for the active
 * environment, the supported browser-name union, and an immutable snapshot of
 * the run context. Built on existing config types (no duplication).
 *
 * Used By:
 * @helpers/environment.helper (ExecutionContext / Environment / BrowserName).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import type { AppEnvironment } from '@config/env';
import type { DeepReadonly } from '@apptypes/common.types';

/** Friendly alias for the active target environment (union from config). */
export type Environment = AppEnvironment;

/** Supported Playwright browser engines (literal union). */
export type BrowserName = 'chromium' | 'firefox' | 'webkit';

/** Mutable shape of the run-context snapshot (kept private to this module). */
interface ExecutionContextShape {
  environment: Environment;
  browser: BrowserName;
  ci: boolean;
  headless: boolean;
  slowMoMs: number;
}

/** Immutable snapshot of how the current run is configured (mapped type). */
export type ExecutionContext = DeepReadonly<ExecutionContextShape>;
