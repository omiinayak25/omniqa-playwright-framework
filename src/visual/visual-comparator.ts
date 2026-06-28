/**
 * --------------------------------------------------------
 * File: visual-comparator.ts
 * Module: Visual Regression
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Reusable wrapper around Playwright's `toHaveScreenshot` snapshot assertion.
 * Owns the "how to take a stable, comparable screenshot" detail so specs do
 * one-liners and every snapshot shares the same stabilisation + tolerance.
 *
 * Responsibilities:
 * - Stabilise the page (fonts ready, injected freeze stylesheet, animations
 *   disabled) before capture.
 * - Merge env-driven defaults (config.visual) with per-call overrides and
 *   resolve dynamic-element masks.
 * - Assert full-page or per-element snapshots against committed baselines.
 *
 * Used By:
 * visual.fixtures.ts (DI as the `visual` fixture), tests/visual/** specs.
 *
 * Dependencies:
 * Playwright (expect/Page/Locator), node:path, winston Logger,
 * scopedLogger (@utils/logger), config (@config/config),
 * visual.types, dynamic-elements.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Baselines are stored by Playwright next to the spec in `*-snapshots/`, with
 * the project name AND platform appended to each file — so a single helper call
 * yields per-browser, per-OS baselines (true cross-browser snapshots) with no
 * extra code. First run writes baselines (`--update-snapshots`); later runs
 * compare against them.
 * --------------------------------------------------------
 */
import * as path from 'node:path';
import { expect, type Page, type Locator } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import { config } from '@config/config';
import type { VisualCompareOptions } from '@visual/visual.types';
import { toMaskLocators } from '@visual/dynamic-elements';

/** Absolute path to the freeze stylesheet injected during every capture. */
const STABILIZE_CSS = path.join(__dirname, 'screenshot.css');

/** Options common to page- and element-level snapshots. */
interface CommonScreenshotOptions {
  threshold: number;
  maxDiffPixelRatio: number;
  animations: 'disabled' | 'allow';
  caret: 'hide';
  stylePath: string | string[];
  mask?: Locator[];
  maxDiffPixels?: number;
  omitBackground?: boolean;
  timeout?: number;
}

/**
 * VisualComparator turns "is this screen visually unchanged?" into a single
 * call. TEST-scoped (bound to one page) and stateless between calls.
 */
export class VisualComparator {
  private readonly page: Page;
  private readonly log: Logger;
  private readonly defaults = config.visual;

  constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger('Visual');
  }

  /**
   * Purpose: Assert the page matches its committed full-page/viewport baseline.
   * @param name - Stable snapshot name (becomes `<name>.png` + project/platform).
   * @param options - Optional per-call overrides (mask, threshold, fullPage…).
   * @returns Promise that resolves when the snapshot matches (or is written).
   * @example await visual.expectPage('saucedemo-login');
   */
  public async expectPage(name: string, options: VisualCompareOptions = {}): Promise<void> {
    await this.stabilize();
    const fullPage = options.fullPage ?? this.defaults.fullPage;
    this.log.info(`Visual compare (page, fullPage=${fullPage}): ${name}`);
    await expect(this.page).toHaveScreenshot(this.fileName(name), {
      ...this.buildCommon(options),
      fullPage,
    });
  }

  /**
   * Purpose: Assert a single element matches its committed baseline.
   * @param locator - Element to capture (e.g. a card, a form, a header).
   * @param name - Stable snapshot name.
   * @param options - Optional per-call overrides (mask, threshold…).
   * @returns Promise that resolves when the snapshot matches (or is written).
   * @example await visual.expectElement(page.locator('.login_form'), 'login-form');
   */
  public async expectElement(
    locator: Locator,
    name: string,
    options: VisualCompareOptions = {},
  ): Promise<void> {
    await this.stabilize();
    this.log.info(`Visual compare (element): ${name}`);
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toHaveScreenshot(this.fileName(name), this.buildCommon(options));
  }

  // ----------------------------------------------------------------- internals

  /** Wait for web fonts to finish loading so glyphs render identically. */
  private async stabilize(): Promise<void> {
    await this.page
      .evaluate(async () => {
        if (document.fonts !== undefined) await document.fonts.ready;
      })
      .catch(() => undefined);
  }

  /** Build the options shared by page and element snapshots. */
  private buildCommon(options: VisualCompareOptions): CommonScreenshotOptions {
    const mask = this.resolveMask(options);
    const common: CommonScreenshotOptions = {
      threshold: options.threshold ?? this.defaults.threshold,
      maxDiffPixelRatio: options.maxDiffPixelRatio ?? this.defaults.maxDiffPixelRatio,
      animations: options.animations ?? this.defaults.animations,
      caret: 'hide',
      stylePath: this.resolveStylePaths(options.stylePath),
    };
    if (mask.length > 0) common.mask = mask;
    if (options.maxDiffPixels !== undefined) common.maxDiffPixels = options.maxDiffPixels;
    if (options.omitBackground !== undefined) common.omitBackground = options.omitBackground;
    if (options.timeoutMs !== undefined) common.timeout = options.timeoutMs;
    return common;
  }

  /** Combine explicit mask locators with selector-based dynamic masks. */
  private resolveMask(options: VisualCompareOptions): Locator[] {
    const explicit = options.mask !== undefined ? [...options.mask] : [];
    const fromSelectors = toMaskLocators(this.page, options.maskSelectors ?? []);
    return [...explicit, ...fromSelectors];
  }

  /** Always inject the freeze stylesheet, then any caller-supplied sheets. */
  private resolveStylePaths(extra: string | readonly string[] | undefined): string | string[] {
    if (extra === undefined) return STABILIZE_CSS;
    const extras = typeof extra === 'string' ? [extra] : [...extra];
    return [STABILIZE_CSS, ...extras];
  }

  /** Normalise a logical name into a `.png` snapshot file name. */
  private fileName(name: string): string {
    return name.endsWith('.png') ? name : `${name}.png`;
  }
}
