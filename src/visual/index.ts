/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Visual Regression
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Barrel (re-export) module for the visual-regression package so callers use a
 * single, stable import path.
 *
 * Responsibilities:
 * - Re-export the comparator, dynamic-element registry/helper, and types.
 *
 * Used By:
 * visual.fixtures.ts and any code consuming the visual layer directly.
 *
 * Dependencies:
 * The sibling visual-* modules it re-exports.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Mirrors the @utils/@accessibility barrel convention so visual imports stay
 * short and stable even if a file is later split or moved.
 * --------------------------------------------------------
 */
export { VisualComparator } from '@visual/visual-comparator';
export { DYNAMIC_SELECTORS, toMaskLocators } from '@visual/dynamic-elements';
export type { VisualCompareOptions } from '@visual/visual.types';
