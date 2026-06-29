/**
 * --------------------------------------------------------
 * File: fixture.types.ts
 * Module: Fixtures (DI)
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Type contracts for the custom Playwright fixtures, split by SCOPE so the
 * compiler enforces which fixtures are worker- vs test-scoped.
 *
 * Responsibilities:
 * - Define TestDataApi (the intention-revealing test-data generator).
 * - Define WorkerFixtures (created once per worker) and TestFixtures
 *   (created per test) interface contracts.
 *
 * Used By:
 * base.fixtures.ts (and, by extension, the whole fixture chain).
 *
 * Dependencies:
 * winston (Logger type), @models/config.model (FrameworkConfig type).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Scope split rationale:
 *  - WorkerFixtures: created ONCE per worker process (expensive/shared things:
 *    config, a worker-tagged logger, the DB pool & API request context).
 *  - TestFixtures: created per test (cheap, isolated: a test-scoped logger, a
 *    fresh test-data generator, page objects & service instances).
 * Later layers EXTEND these interfaces (pages, api, db) — the contract grows by
 * composition, never rewrite.
 * --------------------------------------------------------
 */
import type { Logger } from 'winston';
import type { FrameworkConfig } from '@models/config.model';

/** Intention-revealing test-data generator injected into every test. */
export interface TestDataApi {
  readonly firstName: () => string;
  readonly lastName: () => string;
  readonly fullName: () => string;
  readonly email: () => string;
  readonly username: () => string;
  readonly password: (length?: number) => string;
  readonly phone: () => string;
  readonly int: (min: number, max: number) => number;
  readonly uuid: () => string;
}

/** Fixtures created once per worker (shared across that worker's tests). */
export interface WorkerFixtures {
  /** The validated, immutable framework configuration. */
  readonly appConfig: FrameworkConfig;
  /** Logger tagged with the worker index (parallel-run triage). */
  readonly workerLogger: Logger;
}

/** Fixtures created per test (isolated). */
export interface TestFixtures {
  /** Logger scoped to the current test title. */
  readonly log: Logger;
  /** Per-test data generator. */
  readonly data: TestDataApi;
  /**
   * Auto fixture (no manual use): logs test start/end + duration and
   * attaches a diagnostic note on failure. Runs for EVERY test.
   */
  readonly autoLog: void;
}
