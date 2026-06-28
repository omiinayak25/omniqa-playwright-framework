/**
 * --------------------------------------------------------
 * File: dynamic-elements.ts
 * Module: Visual Regression
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Central registry of selectors for non-deterministic UI (clocks, copyright
 * years, avatars, ads) that must be MASKED before a screenshot, plus a helper
 * to turn selectors into Playwright mask locators.
 *
 * Responsibilities:
 * - Provide curated, named selector groups for dynamic regions.
 * - Resolve selector strings into `Locator[]` for the `mask` option.
 *
 * Used By:
 * visual-comparator.ts (mask resolution), tests/visual/** specs.
 *
 * Dependencies:
 * Playwright Page/Locator.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Keeping dynamic selectors in ONE place means a flaky snapshot is fixed by a
 * one-line registry edit, not by hunting masks scattered across specs (DRY).
 * A mask whose selector matches nothing is harmless — Playwright simply paints
 * nothing — so groups can be applied defensively.
 * --------------------------------------------------------
 */
import type { Page, Locator } from '@playwright/test';

/** Named groups of selectors whose content is expected to vary between runs. */
export const DYNAMIC_SELECTORS = {
  /** Generic time/date/relative-time and explicitly-tagged dynamic nodes. */
  COMMON: ['time', '[data-dynamic]', '[data-test="dynamic"]'],
  /** OrangeHRM login footer carries a live "© 2005 – <year>" copyright. */
  ORANGEHRM_LOGIN: ['.orangehrm-login-footer', '.orangehrm-copyright-wrapper'],
} as const satisfies Readonly<Record<string, readonly string[]>>;

/**
 * Purpose: Resolve selector strings into mask locators for `toHaveScreenshot`.
 * @param page - The page the selectors are scoped to.
 * @param selectors - CSS selectors to convert (zero-match selectors are safe).
 * @returns An array of Playwright `Locator`s suitable for the `mask` option.
 */
export function toMaskLocators(page: Page, selectors: readonly string[]): Locator[] {
  return selectors.map((selector) => page.locator(selector));
}
