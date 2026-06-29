/**
 * --------------------------------------------------------
 * File: browser.helper.ts
 * Module: Helpers
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Centralises Chromium launch configuration for the BDD (Cucumber) runner so a
 * single source decides headless + slow-motion, mirroring the Playwright config
 * `use` block. Removes ad-hoc launch options inlined in hooks.
 *
 * Responsibilities:
 * - Build LaunchOptions from config + EnvironmentHelper (headless, slowMo).
 * - Launch a Chromium browser with those options.
 *
 * Used By:
 * src/cucumber/hooks (BeforeAll).
 *
 * Dependencies:
 * @playwright/test (chromium), @config/config, @helpers/environment.helper.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { chromium, type Browser, type LaunchOptions } from '@playwright/test';
import { config } from '@config/config';
import { EnvironmentHelper } from '@helpers/environment.helper';

/** Orchestrates Chromium launch for the Cucumber runner. */
export class BrowserHelper {
  /** Launch options derived from config + environment (headless, slowMo). */
  public static launchOptions(): LaunchOptions {
    return {
      headless: config.execution.headless,
      slowMo: EnvironmentHelper.slowMoMs(),
    };
  }

  /** Launch a Chromium browser using {@link BrowserHelper.launchOptions}. */
  public static launchChromium(): Promise<Browser> {
    return chromium.launch(BrowserHelper.launchOptions());
  }
}
