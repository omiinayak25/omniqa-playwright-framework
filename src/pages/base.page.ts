/**
 * --------------------------------------------------------
 * File: base.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
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
// Import Playwright's type-only contracts for the browser page, an element handle, and a navigation response.
import type { Page, Locator, Response } from '@playwright/test';
// Import the winston Logger type so each page can hold a strongly-typed logger.
import type { Logger } from 'winston';
// Import the factory that builds a logger scoped (tagged) to a given name.
import { scopedLogger } from '@utils/logger';

/**
 * BasePage is the inheritance root of the POM. It exists to centralise
 * navigation and common logged interactions so concrete pages stay focused on
 * their own locators and screen-specific actions (DRY).
 */
// Declare the abstract base class that every concrete page object extends.
export abstract class BasePage {
  // Hold the Playwright page handle this object drives (read-only after construction).
  protected readonly page: Page;
  // Hold the scoped logger used to trace this page's actions.
  protected readonly log: Logger;

  /** Absolute base URL of the owning application (subclass provides it). */
  // Force each subclass to declare the application's base URL.
  protected abstract readonly baseUrl: string;
  /** Route path appended to baseUrl for this page's primary screen. */
  // Force each subclass to declare the route path of its primary screen.
  protected abstract readonly path: string;

  // Construct the page object from a Playwright page (protected → only subclasses instantiate).
  protected constructor(page: Page) {
    // Store the injected page handle for later interactions.
    this.page = page;
    // Build a logger tagged with the concrete subclass's name for readable traces.
    this.log = scopedLogger(this.constructor.name);
  }

  /**
   * Purpose: Navigate to this page's primary URL (baseUrl + path).
   * @returns Promise resolving to the navigation Response (or null if none).
   * @example await new SauceInventoryPage(page).open();
   */
  // Navigate the browser to this page's full URL.
  public async open(): Promise<Response | null> {
    // Compose the absolute URL from the subclass-supplied base URL and path.
    const url = `${this.baseUrl}${this.path}`;
    // Log the navigation target for traceability.
    this.log.info(`Navigating to ${url}`);
    // Go to the URL, waiting only until the DOM is parsed (web-first waits handle the rest).
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Purpose: Return the browser's current page URL.
   * @returns The current URL string.
   */
  // Expose the browser's current URL so tests can assert on navigation.
  public url(): string {
    // Delegate to Playwright's page.url().
    return this.page.url();
  }

  /**
   * Purpose: Return the current document title.
   * @returns Promise resolving to the page title.
   */
  // Expose the current document <title> text.
  public async title(): Promise<string> {
    // Delegate to Playwright's page.title().
    return this.page.title();
  }

  // ----------------------------------------------------- logged action helpers

  /**
   * Purpose: Click a locator while emitting a debug log line.
   * @param locator - Target element to click.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the click completes.
   */
  // Click an element, logging a friendly name for the action.
  protected async click(locator: Locator, name: string): Promise<void> {
    // Emit a debug trace identifying what is being clicked.
    this.log.debug(`Click: ${name}`);
    // Perform the click (Playwright auto-waits for actionability).
    await locator.click();
  }

  /**
   * Purpose: Fill an input with a value while emitting a debug log line.
   * @param locator - Target input element.
   * @param value - Value to fill in.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the input is filled.
   */
  // Fill an input with a value, logging the field name and value.
  protected async type(locator: Locator, value: string, name: string): Promise<void> {
    // Emit a debug trace of the field and the value being typed.
    this.log.debug(`Type into ${name}: "${value}"`);
    // Fill the input (clears then sets the value, auto-waiting for the field).
    await locator.fill(value);
  }

  /**
   * Purpose: Read and trim a locator's text content while logging it.
   * @param locator - Target element to read.
   * @param name - Human-readable name used in the log message.
   * @returns Promise resolving to the trimmed text ('' when empty).
   */
  // Read an element's text content, trimmed, logging the result.
  protected async readText(locator: Locator, name: string): Promise<string> {
    // Read the text content, trim whitespace, and default to '' when null.
    const text = (await locator.textContent())?.trim() ?? '';
    // Emit a debug trace of what was read.
    this.log.debug(`Read ${name}: "${text}"`);
    // Return the cleaned text to the caller.
    return text;
  }

  /**
   * Purpose: Select a dropdown option by its value while logging it.
   * @param locator - Target <select> element.
   * @param value - Option value to select.
   * @param name - Human-readable name used in the log message.
   * @returns Promise that resolves once the option is selected.
   */
  // Select a <select> option by its value attribute, logging the choice.
  protected async selectByValue(locator: Locator, value: string, name: string): Promise<void> {
    // Emit a debug trace of the dropdown and chosen value.
    this.log.debug(`Select ${name}: "${value}"`);
    // Choose the option whose value matches (auto-waits for the select).
    await locator.selectOption(value);
  }

  /**
   * Purpose: Wait until the page URL contains a fragment — used after actions
   * that trigger client-side navigation before tests assert on the new screen.
   * @param fragment - Substring expected to appear in the URL.
   * @param timeoutMs - Max wait in milliseconds (default 15000).
   * @returns Promise that resolves once the URL matches.
   */
  // Wait until the URL contains a given fragment (post-navigation synchronisation).
  protected async waitForUrlContains(fragment: string, timeoutMs = 15_000): Promise<void> {
    // Poll the URL until it includes the fragment, bounded by the timeout.
    await this.page.waitForURL((url) => url.toString().includes(fragment), { timeout: timeoutMs });
  }
}
