/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Accessibility
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel (re-export) module for the accessibility package so callers use a
 * single, stable import path.
 *
 * Responsibilities:
 * - Re-export the scanner, keyboard navigator, assertions, reporter, and the
 *   public accessibility types/constants.
 *
 * Used By:
 * a11y.fixtures.ts and any code consuming the accessibility layer directly.
 *
 * Dependencies:
 * The sibling accessibility-* modules it re-exports.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Mirrors the @utils/@constants barrel convention so accessibility imports
 * stay short and stable even if a file is later split or moved.
 * --------------------------------------------------------
 */
export { AccessibilityScanner } from '@accessibility/accessibility-scanner';
export { KeyboardNavigator } from '@accessibility/keyboard-navigator';
export { AccessibilityAssertions } from '@accessibility/accessibility-assertions';
export { AccessibilityReporter } from '@accessibility/accessibility-reporter';
export type { FocusedElement } from '@accessibility/keyboard-navigator';
export * from '@accessibility/accessibility.types';
