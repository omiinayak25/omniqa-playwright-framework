/**
 * --------------------------------------------------------
 * File: visual.types.ts
 * Module: Visual Regression
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Type contract for the visual-regression layer — the per-comparison options
 * accepted by VisualComparator. A single typed surface so specs express intent
 * (mask these, tolerate this much drift) without touching Playwright's raw
 * screenshot option shapes.
 *
 * Responsibilities:
 * - Define VisualCompareOptions (overrides + masking knobs).
 *
 * Used By:
 * visual-comparator.ts, tests/visual/** specs.
 *
 * Dependencies:
 * Playwright Locator (mask targets only — no runtime).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Every field is OPTIONAL — unspecified values fall back to the env-driven
 * defaults in `config.visual` (see @config/config). Threshold/ratio mirror
 * Playwright's `toHaveScreenshot` semantics so there is no behavioural surprise.
 * --------------------------------------------------------
 */
import type { Locator } from '@playwright/test';

/** Per-comparison overrides for a single visual snapshot assertion. */
export interface VisualCompareOptions {
  /** Capture the whole scrollable page (page snapshots only). */
  readonly fullPage?: boolean;
  /** Per-pixel colour sensitivity (0 = strict … 1 = lax). */
  readonly threshold?: number;
  /** Max share of differing pixels (0–1) before the snapshot fails. */
  readonly maxDiffPixelRatio?: number;
  /** Absolute max differing pixels (alternative to the ratio). */
  readonly maxDiffPixels?: number;
  /** Freeze (`disabled`) or keep (`allow`) CSS animations during capture. */
  readonly animations?: 'disabled' | 'allow';
  /** Render with a transparent background (element snapshots). */
  readonly omitBackground?: boolean;
  /** Pre-built locators to paint over (e.g. an avatar, a live counter). */
  readonly mask?: readonly Locator[];
  /** Convenience: CSS selectors to mask, resolved against the page. */
  readonly maskSelectors?: readonly string[];
  /** Extra stylesheet path(s) applied during capture (adds to the default). */
  readonly stylePath?: string | readonly string[];
  /** Per-assertion timeout in ms (defaults to the global expect timeout). */
  readonly timeoutMs?: number;
}
