/**
 * --------------------------------------------------------
 * File: config.model.ts
 * Module: Domain Models
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Configuration domain interfaces describing the SHAPE of the framework's
 * runtime configuration (ui, api, database, execution).
 *
 * Responsibilities:
 * - Define the readonly interfaces assembled by the configuration layer.
 *
 * Used By:
 * @config/config.ts (builds/validates these shapes) and every consumer of config.
 *
 * Dependencies:
 * @config/env (AppEnvironment enum).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Everything is `readonly` — configuration is immutable once loaded
 * (no test should mutate global config mid-run).
 * --------------------------------------------------------
 */
import type { AppEnvironment } from '@config/env';

/** Credentials pair for a UI application under test. */
export interface Credentials {
  readonly username: string;
  readonly password: string;
}

/** UI applications under test and their entry points. */
export interface UiConfig {
  readonly sauceDemo: {
    readonly baseUrl: string;
    readonly credentials: Credentials;
  };
  readonly orangeHrm: {
    readonly baseUrl: string;
    readonly credentials: Credentials;
  };
}

/** API base URLs (and keys/creds where the public API requires them). */
export interface ApiConfig {
  readonly restfulBooker: {
    readonly baseUrl: string;
    readonly credentials: Credentials;
  };
  readonly reqres: {
    readonly baseUrl: string;
    readonly apiKey: string;
  };
  readonly dummyJson: { readonly baseUrl: string };
  readonly jsonPlaceholder: { readonly baseUrl: string };
  readonly petStore: { readonly baseUrl: string };
}

/** PostgreSQL connection + pool configuration. */
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly schema: string;
  readonly ssl: boolean;
  readonly poolMax: number;
  readonly idleTimeoutMs: number;
}

/** Cross-cutting execution tuning. */
export interface ExecutionConfig {
  readonly headless: boolean;
  readonly defaultTimeoutMs: number;
  readonly expectTimeoutMs: number;
  readonly retries: number;
  readonly workers: number;
  readonly logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/** Visual-regression (screenshot) comparison defaults. */
export interface VisualConfig {
  /** Max share of differing pixels (0–1) tolerated before a diff fails. */
  readonly maxDiffPixelRatio: number;
  /** Per-pixel colour sensitivity (0 = strict, 1 = lax) — YIQ distance. */
  readonly threshold: number;
  /** Whether CSS animations/transitions are frozen before capture. */
  readonly animations: 'disabled' | 'allow';
  /** Default to capturing the full scrollable page (vs. viewport only). */
  readonly fullPage: boolean;
}

/** Default performance budget thresholds (a regression gate, env-driven). */
export interface PerformanceBudgetConfig {
  /** Max `load` event time from navigation start (ms). */
  readonly maxLoadMs: number;
  /** Max `DOMContentLoaded` time from navigation start (ms). */
  readonly maxDomContentLoadedMs: number;
  /** Max time-to-first-byte (ms). */
  readonly maxTtfbMs: number;
  /** Max First Contentful Paint (ms). */
  readonly maxFcpMs: number;
  /** Max Largest Contentful Paint (ms). */
  readonly maxLcpMs: number;
  /** Max total transferred bytes across all resources. */
  readonly maxTransferBytes: number;
  /** Max number of network resource requests. */
  readonly maxResourceCount: number;
}

/** Lighthouse integration toggle + pass threshold. */
export interface LighthouseConfig {
  /** Whether the Lighthouse audit spec runs (it is heavy + needs the CLI). */
  readonly enabled: boolean;
  /** Minimum acceptable Lighthouse performance category score (0–1). */
  readonly minPerformanceScore: number;
}

/** Performance smoke-testing configuration. */
export interface PerformanceConfig {
  readonly budget: PerformanceBudgetConfig;
  readonly lighthouse: LighthouseConfig;
}

/** The single, fully-resolved framework configuration object. */
export interface FrameworkConfig {
  readonly environment: AppEnvironment;
  readonly ui: UiConfig;
  readonly api: ApiConfig;
  readonly database: DatabaseConfig;
  readonly execution: ExecutionConfig;
  readonly visual: VisualConfig;
  readonly performance: PerformanceConfig;
}
