/**
 * --------------------------------------------------------
 * File: base.component.ts
 * Module: UI Components
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Abstract base class for all reusable UI component objects. Models a REUSABLE
 * widget (header, table, modal, pagination) that appears across many pages and
 * is COMPOSED into pages (composition over inheritance: a page HAS-A header).
 *
 * Responsibilities:
 * - Hold the Playwright `page`, a scoped `root` Locator, and a scoped logger
 * - Scope each component to a `root` so its internal locators stay relative —
 *   the same component works wherever it's mounted
 * - Expose shared component behaviour (e.g. visibility checks)
 *
 * Used By:
 * Extended by all component objects: data-table.component.ts,
 * pagination.component.ts, header.component.ts
 *
 * Dependencies:
 * Playwright (Page, Locator), winston Logger, scopedLogger (@utils/logger)
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the winston Logger type for the scoped logger field.
import type { Logger } from 'winston';
// Import the factory that builds a name-scoped logger.
import { scopedLogger } from '@utils/logger';

/**
 * BaseComponent is the inheritance root for component objects. It exists so
 * every reusable widget shares a common shape — a scoped `root` Locator plus a
 * named logger — enabling pages to compose widgets rather than inherit them.
 */
// Declare the abstract base class every reusable component extends.
export abstract class BaseComponent {
  // Hold the Playwright page the component lives on.
  protected readonly page: Page;
  // Hold the root locator that scopes this component's internals.
  protected readonly root: Locator;
  // Hold the scoped logger for this component.
  protected readonly log: Logger;

  // Construct from a page and a root locator (protected → subclasses only).
  protected constructor(page: Page, root: Locator) {
    // Store the page handle.
    this.page = page;
    // Store the root locator (all internal locators stay relative to it).
    this.root = root;
    // Build a logger tagged with the concrete subclass's name.
    this.log = scopedLogger(this.constructor.name);
  }

  /**
   * Purpose: Report whether the component's root element is currently rendered.
   * @returns Promise resolving to true when the root Locator is visible.
   * @example if (await header.isVisible()) { ... }
   */
  // Report whether this component's root element is visible.
  public async isVisible(): Promise<boolean> {
    // Delegate to the root locator's visibility.
    return this.root.isVisible();
  }
}
