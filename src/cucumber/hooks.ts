/**
 * --------------------------------------------------------
 * File: hooks.ts
 * Module: BDD Runtime
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Cucumber-JS lifecycle hooks that set up and tear down the browser and the
 * per-scenario World, mirroring Playwright's beforeAll/afterEach semantics.
 *
 * Responsibilities:
 * - BeforeAll/AfterAll: launch and close ONE browser for the whole BDD run.
 * - Before: create a fresh context + page + API context on the World per
 *   scenario; @auth scenarios reuse the stored SauceDemo storageState.
 * - After: attach a screenshot on failure, then dispose scenario resources.
 *
 * Used By:
 * Cucumber runner via cucumber.js (loaded alongside step definitions).
 *
 * Dependencies:
 * @cucumber/cucumber (hook registrars, Status), @playwright/test (chromium,
 * request), @config/config, @constants/paths.constants, @utils/logger,
 * @utils/file.util, @bdd/world (CustomWorld).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * One browser is shared across the run for speed; each scenario still gets an
 * isolated context/page so scenarios cannot affect each other.
 * --------------------------------------------------------
 *
 * BDD HOOK FLOW:
 *   BeforeAll → launch shared browser (once)
 *     Before  → new context/page/apiContext on a fresh World (per scenario)
 *       steps → run `this`-bound to that World
 *     After   → screenshot if FAILED, dispose apiContext + close context
 *   AfterAll  → close shared browser (once)
 */
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
  type ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { request, type Browser } from '@playwright/test';
import { SAUCE_AUTH_FILE } from '@constants/paths.constants';
import { logger } from '@utils/logger';
import { BrowserHelper, StorageStateHelper } from '@helpers/index';
import type { CustomWorld } from '@bdd/world';

setDefaultTimeout(60_000);

let browser: Browser;

BeforeAll(async function () {
  logger.info('[BDD] Launching browser');
  browser = await BrowserHelper.launchChromium();
});

AfterAll(async function () {
  await browser?.close();
  logger.info('[BDD] Browser closed');
});

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const tags = scenario.pickle.tags.map((t) => t.name);
  // @auth scenarios start from the stored SauceDemo session (if available).
  // WHY reuse storageState: skip the UI login for @auth scenarios by starting
  // from a previously saved session, but only if that state file actually exists.
  const useAuth = tags.includes('@auth');

  this.context = await browser.newContext(
    useAuth ? StorageStateHelper.contextOptionsFor(SAUCE_AUTH_FILE) : undefined,
  );
  this.page = await this.context.newPage();
  this.apiContext = await request.newContext({ ignoreHTTPSErrors: true });
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
  }
  await this.apiContext?.dispose();
  await this.context?.close();
});
