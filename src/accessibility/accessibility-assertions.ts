/**
 * --------------------------------------------------------
 * File: accessibility-assertions.ts
 * Module: Accessibility
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Intention-revealing accessibility assertions. Composes the scanner,
 * keyboard navigator, and reporter so a spec reads as business intent
 * ("expect no contrast violations", "expect the submit button is reachable
 * by keyboard") instead of axe/keyboard plumbing.
 *
 * Responsibilities:
 * - Scan + record + assert in one call for the common concerns
 *   (full WCAG, alt text, labels, contrast, ARIA).
 * - Provide impact-gated and pure-result assertions for advanced cases.
 * - Provide keyboard-operability assertions (reachable-by-tab, focus order).
 *
 * Used By:
 * a11y.fixtures.ts (DI as the `a11y` fixture), tests/accessibility/** specs.
 *
 * Dependencies:
 * Playwright expect, accessibility-scanner, keyboard-navigator,
 * accessibility-reporter, accessibility.types.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * This is the ONLY accessibility collaborator that calls `expect`. Keeping
 * assertions here (and scanning/driving/reporting in their own classes)
 * preserves Single Responsibility and makes each piece reusable on its own.
 * Every scan-based assertion records to the report BEFORE asserting, so a
 * failing scan still produces its artifact + attachment.
 * --------------------------------------------------------
 */
import { expect } from '@playwright/test';
import type { AccessibilityScanner } from '@accessibility/accessibility-scanner';
import type { KeyboardNavigator } from '@accessibility/keyboard-navigator';
import type { AccessibilityReporter } from '@accessibility/accessibility-reporter';
import {
  IMPACT_ORDER,
  type A11yImpact,
  type A11yScanOptions,
  type A11yScanResult,
  type A11yViolation,
} from '@accessibility/accessibility.types';

/**
 * AccessibilityAssertions turns scans and keyboard probes into pass/fail
 * outcomes. TEST-scoped; receives its collaborators via constructor injection.
 */
export class AccessibilityAssertions {
  private readonly scanner: AccessibilityScanner;
  private readonly keyboard: KeyboardNavigator;
  private readonly reporter: AccessibilityReporter;

  constructor(
    scanner: AccessibilityScanner,
    keyboard: KeyboardNavigator,
    reporter: AccessibilityReporter,
  ) {
    this.scanner = scanner;
    this.keyboard = keyboard;
    this.reporter = reporter;
  }

  // ----------------------------------------------------------- scan + assert

  /**
   * Purpose: Full WCAG 2.0/2.1 A+AA scan; record artifacts; assert zero
   * violations. The everyday "is this screen accessible?" assertion.
   * @returns The recorded scan result (useful for further inspection).
   */
  public async expectNoViolations(
    label: string,
    options: A11yScanOptions = {},
  ): Promise<A11yScanResult> {
    const result = await this.scanner.scanWcag(label, options);
    await this.reporter.record(result);
    this.assertClean(result, result.violations);
    return result;
  }

  /** Purpose: Assert no missing/empty alternative-text violations. */
  public async expectNoAltTextIssues(
    label: string,
    options: A11yScanOptions = {},
  ): Promise<A11yScanResult> {
    const result = await this.scanner.scanAltText(label, options);
    await this.reporter.record(result);
    this.assertClean(result, result.violations);
    return result;
  }

  /** Purpose: Assert every form control is programmatically labeled. */
  public async expectAllFieldsLabeled(
    label: string,
    options: A11yScanOptions = {},
  ): Promise<A11yScanResult> {
    const result = await this.scanner.scanFormLabels(label, options);
    await this.reporter.record(result);
    this.assertClean(result, result.violations);
    return result;
  }

  /** Purpose: Assert text/UI meets the WCAG AA contrast ratio. */
  public async expectSufficientColorContrast(
    label: string,
    options: A11yScanOptions = {},
  ): Promise<A11yScanResult> {
    const result = await this.scanner.scanColorContrast(label, options);
    await this.reporter.record(result);
    this.assertClean(result, result.violations);
    return result;
  }

  /** Purpose: Assert ARIA roles/states/properties are valid and allowed. */
  public async expectValidAria(
    label: string,
    options: A11yScanOptions = {},
  ): Promise<A11yScanResult> {
    const result = await this.scanner.scanAria(label, options);
    await this.reporter.record(result);
    this.assertClean(result, result.violations);
    return result;
  }

  // --------------------------------------------------------- result-only forms

  /**
   * Purpose: Assert a previously-captured result has no violation at or above
   * a minimum impact (e.g. allow `minor` noise, fail on `serious`+).
   * @param result - A result already produced by the scanner.
   * @param minImpact - Lowest impact considered a failure.
   */
  public expectNoViolationsAbove(result: A11yScanResult, minImpact: A11yImpact): void {
    const threshold = IMPACT_ORDER[minImpact];
    const breaching = result.violations.filter(
      (v) => v.impact !== 'unknown' && IMPACT_ORDER[v.impact] >= threshold,
    );
    this.assertClean(result, breaching, `(impact ≥ ${minImpact})`);
  }

  /** Purpose: Pure assertion over an already-captured, recorded result. */
  public expectResultClean(result: A11yScanResult): void {
    this.assertClean(result, result.violations);
  }

  // ----------------------------------------------------------- keyboard a11y

  /**
   * Purpose: Assert a target is reachable using only the Tab key.
   * @param selector - CSS selector that must eventually receive focus.
   * @param maxTabs - Upper bound on Tab presses (default 20).
   */
  public async expectReachableByTab(selector: string, maxTabs = 20): Promise<void> {
    const reachable = await this.keyboard.isReachableByTab(selector, maxTabs);
    expect(
      reachable,
      `Expected "${selector}" to be keyboard-focusable within ${maxTabs} Tab press(es).`,
    ).toBe(true);
  }

  /**
   * Purpose: Assert the next Tab stops match the expected selectors, in order.
   * @param selectors - Ordered CSS selectors expected to receive focus.
   */
  public async expectFocusOrder(selectors: readonly string[]): Promise<void> {
    for (const [index, selector] of selectors.entries()) {
      await this.keyboard.tab();
      const focused = await this.keyboard.isFocused(selector);
      const actual = await this.keyboard.focused();
      expect(
        focused,
        `Tab stop #${index + 1} should focus "${selector}", but focus was ` +
          `<${actual.tag}${actual.id ? `#${actual.id}` : ''}>.`,
      ).toBe(true);
    }
  }

  // ----------------------------------------------------------------- internals

  /** Assert a set of violations is empty, with a rich diagnostic message. */
  private assertClean(
    result: A11yScanResult,
    violations: readonly A11yViolation[],
    suffix = '',
  ): void {
    const label = suffix ? `${result.label} ${suffix}` : result.label;
    expect(violations, this.describe(label, violations)).toHaveLength(0);
  }

  /** Build a readable multi-line failure message from violations. */
  private describe(label: string, violations: readonly A11yViolation[]): string {
    if (violations.length === 0) return `${label}: no accessibility violations`;
    const lines = violations.map((v) => {
      const targets = v.nodes.map((n) => `      - ${n.target}`).join('\n');
      return `  • [${v.impact}] ${v.id} — ${v.help}\n    ${v.helpUrl}\n${targets}`;
    });
    return `${label}: ${violations.length} accessibility violation(s):\n${lines.join('\n')}`;
  }
}
