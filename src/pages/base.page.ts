/**
 * --------------------------------------------------------
 * File: base.page.ts
 * Module: Page Objects
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Abstract root of the Page Object Model. Provides navigation and shared,
 * logged interaction helpers that every concrete page inherits.
 *
 * Responsibilities:
 * - Hold the Playwright `page` and a scoped logger
 * - Require subclasses to supply `baseUrl` + `path`, and navigate via open()
 * - Offer DRY logged helpers (click/type/readText/select/waitForUrlContains)
 *   that wrap Playwright's auto-waiting web-first APIs (no manual sleeps)
 *
 * Design rules enforced:
 * - Pages hold LOCATORS and ACTIONS only; business assertions live in tests.
 *   Pages may expose state via getters so tests can assert on it.
 * - Concrete pages provide their own `path` and compose Components.
 *
 * Used By:
 * Extended by every page object (saucedemo/* and orangehrm/*)
 *
 * Dependencies:
 * Playwright (Page, Locator, Response), winston Logger, scopedLogger (@utils/logger)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
import type { Page, Locator, Response } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';

/**
 * BasePage is the inheritance root of the POM. It exists to centralise
 * navigation and common logged interactions so concrete pages stay focused on
 * their own locators and screen-specific actions (DRY).
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly log: Logger;

  /** Absolute base URL of the owning application (subclass provides it). */
  protected abstract readonly baseUrl: string;
  /** Route path appended to baseUrl for this page's primary screen. */
  protected abstract readonly path: string;

  protected constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger(this.constructor.name);
  }

  /**
   * Purpose: Navigate to this page's primary URL (baseUrl + path).
   * @returns Promise resolving to the navigation Response (or null if none).
   * @example await new SauceInventoryPage(page).open();
   */
  public async open(): Promise<Response | null> {
    const url = `${this.baseUrl}${this.path}`;
    this.log.info(`Navigating to ${url}`);
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Purpose: Return the browser's current page URL.
   * @returns The current URL string.
   */
  public url(): string {
    return this.page.url();
  }

  /**
   * Purpose: Return the current document title.
   * @returns Promise resolving to the page title.
   */
  public async title(): Promise<string> {
    return this.page.title();
  }

  // ----------------------------------------------------- logged action helpers

  /**
   * Purpose: Click a locator while emitting a debug log line.
   * @param locator - Target element to click.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the click completes.
   */
  protected async click(locator: Locator, name: string): Promise<void> {
    this.log.debug(`Click: ${name}`);
    await locator.click();
  }

  /**
   * Purpose: Fill an input with a value while emitting a debug log line.
   * @param locator - Target input element.
   * @param value - Value to fill in.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the input is filled.
   */
  protected async type(locator: Locator, value: string, name: string): Promise<void> {
    this.log.debug(`Type into ${name}: "${value}"`);
    await locator.fill(value);
  }

  /**
   * Purpose: Read and trim a locator's text content while logging it.
   * @param locator - Target element to read.
   * @param name - Human-readable name used in the log message.
   * @returns Promise resolving to the trimmed text ('' when empty).
   */
  protected async readText(locator: Locator, name: string): Promise<string> {
    const text = (await locator.textContent())?.trim() ?? '';
    this.log.debug(`Read ${name}: "${text}"`);
    return text;
  }

  /**
   * Purpose: Select a dropdown option by its value while logging it.
   * @param locator - Target <select> element.
   * @param value - Option value to select.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the option is selected.
   */
  protected async selectByValue(locator: Locator, value: string, name: string): Promise<void> {
    this.log.debug(`Select ${name}: "${value}"`);
    await locator.selectOption(value);
  }

  /**
   * Purpose: Wait until the page URL contains a fragment — used after actions
   * that trigger client-side navigation before tests assert on the new screen.
   * @param fragment - Substring expected to appear in the URL.
   * @param timeoutMs - Max wait in milliseconds (default 15000).
   * @returns Promise that resolves once the URL matches.
   */
  protected async waitForUrlContains(fragment: string, timeoutMs = 15_000): Promise<void> {
    await this.page.waitForURL((url) => url.toString().includes(fragment), { timeout: timeoutMs });
  }
}
