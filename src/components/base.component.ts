/**
 * --------------------------------------------------------
 * File: base.component.ts
 * Module: UI Components
 * Project: OMNIQA Playwright Framework
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
import type { Page, Locator } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';

/**
 * BaseComponent is the inheritance root for component objects. It exists so
 * every reusable widget shares a common shape — a scoped `root` Locator plus a
 * named logger — enabling pages to compose widgets rather than inherit them.
 */
export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;
  protected readonly log: Logger;

  protected constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
    this.log = scopedLogger(this.constructor.name);
  }

  /**
   * Purpose: Report whether the component's root element is currently rendered.
   * @returns Promise resolving to true when the root Locator is visible.
   * @example if (await header.isVisible()) { ... }
   */
  public async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
