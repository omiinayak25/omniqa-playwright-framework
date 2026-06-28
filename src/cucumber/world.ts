/**
 * --------------------------------------------------------
 * File: world.ts
 * Module: BDD Runtime
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Defines CustomWorld — the per-scenario context object for Cucumber-JS that
 * carries the Playwright page/context/API context and a shared state bag.
 *
 * Responsibilities:
 * - Hold the BDD scenario's Playwright `context`, `page`, and `apiContext`.
 * - Expose a scenario-scoped Winston logger.
 * - Provide a typed get/set state bag for passing data between steps.
 * - Register itself as the Cucumber World constructor.
 *
 * Used By:
 * cucumber/hooks.ts and all step definitions (`this`-bound), via cucumber.js.
 *
 * Dependencies:
 * @cucumber/cucumber (World, setWorldConstructor), @playwright/test types,
 * winston (Logger), @utils/logger (scopedLogger).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Cucumber runs on its OWN runner (not Playwright Test), so the World replaces
 * Playwright fixtures as the place state lives. A fresh World is constructed
 * per scenario, giving the same isolation guarantee fixtures give per test.
 * --------------------------------------------------------
 *
 * BDD WORLD/HOOK FLOW:
 *   hooks.Before  → populates this.context/page/apiContext on a NEW World
 *   step defs     → run `this`-bound to that World, sharing state via get/set
 *   hooks.After   → screenshots on failure, then disposes World resources
 */
import { World, setWorldConstructor, type IWorldOptions } from '@cucumber/cucumber';
import type { BrowserContext, Page, APIRequestContext } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';

/**
 * Per-scenario Cucumber World. A new instance is built for each scenario, so
 * the browser context, page, API context, and state bag below never leak
 * between scenarios.
 */
export class CustomWorld extends World {
  public context!: BrowserContext;
  public page!: Page;
  public apiContext!: APIRequestContext;
  // NB: named `logger` (not `log`) — Cucumber's World already defines `log()`.
  public readonly logger: Logger = scopedLogger('BDD');

  /** Free-form bag for passing data between steps (ids, tokens, responses). */
  public readonly state = new Map<string, unknown>();

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Store a value in the shared state bag for later steps.
   * @param key   lookup key (e.g. 'bookingId', 'authToken')
   * @param value value to retain for the rest of the scenario
   */
  public set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  /**
   * Read a value previously stored via {@link set}.
   * @param key the key to look up
   * @returns the stored value, typed as T
   * @throws if no value was stored for the key (fail-fast on missing state)
   */
  public get<T>(key: string): T {
    if (!this.state.has(key)) throw new Error(`[World] No state for key "${key}"`);
    return this.state.get(key) as T;
  }
}

setWorldConstructor(CustomWorld);
