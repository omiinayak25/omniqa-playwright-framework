/**
 * --------------------------------------------------------
 * File: config.ts
 * Module: Configuration
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Single entry point for all framework configuration. Resolves raw
 * environment variables into a fully-typed, validated, immutable
 * FrameworkConfig consumed everywhere in the framework.
 *
 * Responsibilities:
 * - Build the FrameworkConfig tree (ui, api, database, execution) from env.
 * - Fail-fast validation of environment, URLs, and DB port before tests run.
 * - Expose one cached, immutable `config` instance to every layer.
 *
 * Used By:
 * playwright.config.ts, services, repositories, page objects, tests.
 *
 * Dependencies:
 * @config/env (typed env accessors + AppEnvironment),
 * @models/config.model (config interface shapes).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Design pattern — SINGLETON + FACADE:
 *  - Singleton: ConfigManager.getInstance() lazily creates exactly one
 *    instance per process and caches it; all callers share the same
 *    resolved object, so env parsing happens once.
 *  - Facade: the messy details (reading process.env, parsing, defaults,
 *    validation) are hidden behind a clean, typed `config` object.
 *
 * Environment -> Configuration FLOW:
 *   .env / process.env
 *     -> env.ts typed accessors (getEnv/getEnvNumber/...)
 *       -> ConfigManager.build() assembles the FrameworkConfig tree
 *         -> ConfigManager.validate() fails fast on bad input
 *           -> exported `config` (immutable singleton) used framework-wide
 * --------------------------------------------------------
 */
import {
  ACTIVE_ENV,
  AppEnvironment,
  getEnv,
  getEnvBoolean,
  getEnvNumber,
  getEnvOptional,
} from '@config/env';
import type {
  ApiConfig,
  DatabaseConfig,
  ExecutionConfig,
  FrameworkConfig,
  PerformanceConfig,
  UiConfig,
  VisualConfig,
} from '@models/config.model';

type LogLevel = ExecutionConfig['logLevel'];
const VALID_LOG_LEVELS: readonly LogLevel[] = ['error', 'warn', 'info', 'debug'];

/**
 * Singleton + Facade owner of the resolved configuration. Built and
 * validated exactly once in the private constructor (fail-fast); callers
 * never instantiate it directly — they use getInstance() or the exported
 * `config`.
 */
class ConfigManager {
  private static instance: ConfigManager | undefined;
  private readonly config: FrameworkConfig;

  // Constructor is private so the singleton is the only construction path;
  // build() + validate() run here so misconfiguration throws at load time.
  private constructor() {
    this.config = this.build();
    this.validate(this.config);
  }

  /**
   * Lazily create (or return) the single shared instance.
   *
   * @returns The process-wide ConfigManager singleton.
   * @throws Error if the underlying configuration fails validation on first build.
   */
  public static getInstance(): ConfigManager {
    if (ConfigManager.instance === undefined) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /** The fully-resolved, immutable configuration. */
  public get values(): FrameworkConfig {
    return this.config;
  }

  // --------------------------------------------------------------------- build

  private build(): FrameworkConfig {
    return {
      environment: ACTIVE_ENV,
      ui: this.buildUi(),
      api: this.buildApi(),
      database: this.buildDatabase(),
      execution: this.buildExecution(),
      visual: this.buildVisual(),
      performance: this.buildPerformance(),
    };
  }

  private buildUi(): UiConfig {
    return {
      sauceDemo: {
        baseUrl: getEnv('SAUCEDEMO_URL'),
        credentials: {
          username: getEnv('SAUCEDEMO_USERNAME'),
          password: getEnv('SAUCEDEMO_PASSWORD'),
        },
      },
      orangeHrm: {
        baseUrl: getEnv('ORANGEHRM_URL'),
        credentials: {
          username: getEnv('ORANGEHRM_USERNAME'),
          password: getEnv('ORANGEHRM_PASSWORD'),
        },
      },
    };
  }

  private buildApi(): ApiConfig {
    return {
      restfulBooker: {
        baseUrl: getEnv('RESTFUL_BOOKER_URL'),
        credentials: {
          username: getEnv('BOOKER_USERNAME'),
          password: getEnv('BOOKER_PASSWORD'),
        },
      },
      reqres: {
        baseUrl: getEnv('REQRES_URL'),
        apiKey: getEnvOptional('REQRES_API_KEY', 'reqres-free-v1'),
      },
      dummyJson: { baseUrl: getEnv('DUMMYJSON_URL') },
      jsonPlaceholder: { baseUrl: getEnv('JSONPLACEHOLDER_URL') },
      petStore: { baseUrl: getEnv('PETSTORE_URL') },
    };
  }

  private buildDatabase(): DatabaseConfig {
    return {
      host: getEnvOptional('DB_HOST', 'localhost'),
      port: getEnvNumber('DB_PORT', 5432),
      database: getEnvOptional('DB_NAME', 'automation_db'),
      user: getEnvOptional('DB_USER', 'automation_user'),
      password: getEnvOptional('DB_PASSWORD', ''),
      schema: getEnvOptional('DB_SCHEMA', 'public'),
      ssl: getEnvBoolean('DB_SSL', false),
      poolMax: getEnvNumber('DB_POOL_MAX', 10),
      idleTimeoutMs: getEnvNumber('DB_POOL_IDLE_TIMEOUT_MS', 30_000),
    };
  }

  private buildExecution(): ExecutionConfig {
    const rawLevel = getEnvOptional('LOG_LEVEL', 'info') as LogLevel;
    const logLevel: LogLevel = VALID_LOG_LEVELS.includes(rawLevel) ? rawLevel : 'info';
    return {
      headless: getEnvBoolean('HEADLESS', true),
      defaultTimeoutMs: getEnvNumber('DEFAULT_TIMEOUT_MS', 30_000),
      expectTimeoutMs: getEnvNumber('EXPECT_TIMEOUT_MS', 10_000),
      retries: getEnvNumber('RETRIES', 1),
      workers: getEnvNumber('WORKERS', 4),
      logLevel,
    };
  }

  private buildVisual(): VisualConfig {
    const rawAnimations = getEnvOptional('VISUAL_ANIMATIONS', 'disabled');
    return {
      maxDiffPixelRatio: getEnvNumber('VISUAL_MAX_DIFF_PIXEL_RATIO', 0.02),
      threshold: getEnvNumber('VISUAL_THRESHOLD', 0.2),
      animations: rawAnimations === 'allow' ? 'allow' : 'disabled',
      fullPage: getEnvBoolean('VISUAL_FULL_PAGE', true),
    };
  }

  private buildPerformance(): PerformanceConfig {
    return {
      budget: {
        maxLoadMs: getEnvNumber('PERF_MAX_LOAD_MS', 5_000),
        maxDomContentLoadedMs: getEnvNumber('PERF_MAX_DCL_MS', 4_000),
        maxTtfbMs: getEnvNumber('PERF_MAX_TTFB_MS', 1_500),
        maxFcpMs: getEnvNumber('PERF_MAX_FCP_MS', 3_000),
        maxLcpMs: getEnvNumber('PERF_MAX_LCP_MS', 4_000),
        maxTransferBytes: getEnvNumber('PERF_MAX_TRANSFER_KB', 2_048) * 1_024,
        maxResourceCount: getEnvNumber('PERF_MAX_RESOURCES', 100),
      },
      lighthouse: {
        enabled: getEnvBoolean('LIGHTHOUSE_ENABLED', false),
        minPerformanceScore: getEnvNumber('LIGHTHOUSE_MIN_PERF_SCORE', 0.5),
      },
    };
  }

  // ----------------------------------------------------------------- validate

  /**
   * Fail-fast validation: surface misconfiguration before a single test runs.
   *
   * @param cfg The assembled configuration tree to validate.
   * @returns void — returns normally only when configuration is valid.
   * @throws Error listing every problem found (unknown env, malformed URLs, bad DB port).
   */
  private validate(cfg: FrameworkConfig): void {
    const errors: string[] = [];

    if (!Object.values(AppEnvironment).includes(cfg.environment)) {
      errors.push(
        `Unknown TEST_ENV "${cfg.environment}". Expected one of: ${Object.values(
          AppEnvironment,
        ).join(', ')}`,
      );
    }

    const urls: ReadonlyArray<readonly [string, string]> = [
      ['ui.sauceDemo', cfg.ui.sauceDemo.baseUrl],
      ['ui.orangeHrm', cfg.ui.orangeHrm.baseUrl],
      ['api.restfulBooker', cfg.api.restfulBooker.baseUrl],
      ['api.reqres', cfg.api.reqres.baseUrl],
      ['api.dummyJson', cfg.api.dummyJson.baseUrl],
      ['api.jsonPlaceholder', cfg.api.jsonPlaceholder.baseUrl],
      ['api.petStore', cfg.api.petStore.baseUrl],
    ];
    for (const [name, url] of urls) {
      if (!/^https?:\/\//.test(url)) {
        errors.push(`Invalid URL for "${name}": "${url}" (must start with http/https)`);
      }
    }

    if (cfg.database.port <= 0 || cfg.database.port > 65_535) {
      errors.push(`Invalid DB_PORT: ${cfg.database.port}`);
    }

    const ratios: ReadonlyArray<readonly [string, number]> = [
      ['VISUAL_MAX_DIFF_PIXEL_RATIO', cfg.visual.maxDiffPixelRatio],
      ['VISUAL_THRESHOLD', cfg.visual.threshold],
      ['LIGHTHOUSE_MIN_PERF_SCORE', cfg.performance.lighthouse.minPerformanceScore],
    ];
    for (const [name, value] of ratios) {
      if (value < 0 || value > 1) {
        errors.push(`Invalid ${name}: ${value} (must be between 0 and 1)`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`[config] Validation failed:\n  - ${errors.join('\n  - ')}`);
    }
  }
}

/** The resolved, immutable framework configuration (single instance). */
export const config: FrameworkConfig = ConfigManager.getInstance().values;
