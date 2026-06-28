/**
 * --------------------------------------------------------
 * File: accessibility-scanner.ts
 * Module: Accessibility
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Reusable wrapper around `@axe-core/playwright`'s AxeBuilder. Owns the
 * "how to run an axe scan" detail so tests/assertions never touch AxeBuilder
 * directly and every scan is configured and normalised the same way.
 *
 * Responsibilities:
 * - Build and configure an AxeBuilder per scan (tags / rules / include /
 *   exclude / disabled rules / raw options).
 * - Execute the scan and normalise the raw axe result into a stable
 *   `A11yScanResult` (with per-impact counts) for assertions and reports.
 * - Expose focused convenience scans (full WCAG, alt text, labels, contrast,
 *   ARIA) so callers express intent, not rule strings.
 *
 * Used By:
 * accessibility-assertions.ts (composition), a11y.fixtures.ts (DI),
 * tests/accessibility/** specs.
 *
 * Dependencies:
 * @axe-core/playwright (AxeBuilder), Playwright Page, winston Logger,
 * scopedLogger (@utils/logger), accessibility.types.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Single Responsibility: this class only SCANS and NORMALISES. It never
 * asserts and never writes files — assertions and reporting are separate
 * collaborators (see accessibility-assertions.ts / accessibility-reporter.ts).
 * axe-core runs EITHER tags OR an explicit rule list, never both; `scan()`
 * honours that by preferring `rules` when supplied.
 * --------------------------------------------------------
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { AxeResults, Result, NodeResult } from 'axe-core';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import {
  DEFAULT_WCAG_TAGS,
  RULE_SETS,
  type A11yImpact,
  type A11yImpactOrUnknown,
  type A11yScanOptions,
  type A11yScanResult,
  type A11yViolation,
  type A11yViolationNode,
} from '@accessibility/accessibility.types';

/** Normalise axe's optional/nullable impact into our reporting union. */
function normaliseImpact(impact: NodeResult['impact'] | Result['impact']): A11yImpactOrUnknown {
  return impact ?? 'unknown';
}

/** Coerce a single-or-array selector option into a definite array. */
function toSelectorArray(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return [];
  return typeof value === 'string' ? [value] : value;
}

/** Flatten axe's (possibly cross-frame) target selector into a readable path. */
function stringifyTarget(target: NodeResult['target']): string {
  return target.map((part) => (Array.isArray(part) ? part.join(' ') : String(part))).join(' > ');
}

/**
 * AccessibilityScanner runs axe-core against the current page and returns a
 * normalised, report-stable result. It is TEST-scoped (bound to one page) and
 * stateless between calls, so it is safe to reuse across a test's steps.
 */
export class AccessibilityScanner {
  private readonly page: Page;
  private readonly log: Logger;

  constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger('A11yScanner');
  }

  /**
   * Purpose: Run a configured accessibility scan and return a normalised result.
   * @param label - Human-readable name for the scanned screen/state.
   * @param options - Optional tags/rules/include/exclude/disabled-rules.
   * @returns Promise resolving to the normalised {@link A11yScanResult}.
   * @example const r = await scanner.scan('SauceDemo · Login');
   */
  public async scan(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    const builder = new AxeBuilder({ page: this.page });

    // axe-core honours EITHER explicit rules OR tags — never both at once.
    if (options.rules !== undefined && options.rules.length > 0) {
      builder.withRules([...options.rules]);
    } else {
      builder.withTags([...(options.tags ?? DEFAULT_WCAG_TAGS)]);
    }

    for (const selector of toSelectorArray(options.include)) builder.include(selector);
    for (const selector of toSelectorArray(options.exclude)) builder.exclude(selector);

    if (options.disableRules !== undefined && options.disableRules.length > 0) {
      builder.disableRules([...options.disableRules]);
    }
    if (options.runOptions !== undefined) builder.options(options.runOptions);

    this.log.info(`Running axe scan: "${label}"`);
    const raw = await builder.analyze();
    const result = this.normalise(label, raw);

    const total = result.violations.length;
    if (total === 0) {
      this.log.info(`axe scan "${label}" — 0 violations (${result.passCount} passes)`);
    } else {
      this.log.warn(
        `axe scan "${label}" — ${total} violation(s): ` +
          `critical=${result.counts.critical} serious=${result.counts.serious} ` +
          `moderate=${result.counts.moderate} minor=${result.counts.minor}`,
      );
    }
    return result;
  }

  /** Purpose: Full WCAG 2.0/2.1 A+AA scan of the whole page. */
  public scanWcag(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    return this.scan(label, { tags: DEFAULT_WCAG_TAGS, ...options });
  }

  /** Purpose: Focused scan for missing/empty alternative text. */
  public scanAltText(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    return this.scan(label, { rules: RULE_SETS.ALT_TEXT, ...options });
  }

  /** Purpose: Focused scan for unlabeled/ambiguously-labeled form controls. */
  public scanFormLabels(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    return this.scan(label, { rules: RULE_SETS.FORM_LABELS, ...options });
  }

  /** Purpose: Focused scan for insufficient colour contrast (WCAG 1.4.3). */
  public scanColorContrast(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    return this.scan(label, { rules: RULE_SETS.COLOR_CONTRAST, ...options });
  }

  /** Purpose: Focused scan for invalid/unsupported ARIA roles & attributes. */
  public scanAria(label: string, options: A11yScanOptions = {}): Promise<A11yScanResult> {
    return this.scan(label, { rules: RULE_SETS.ARIA, ...options });
  }

  // ------------------------------------------------------------- normalisation

  private normalise(label: string, raw: AxeResults): A11yScanResult {
    const violations = raw.violations.map((v) => this.toViolation(v));
    const counts: Record<A11yImpact, number> = { minor: 0, moderate: 0, serious: 0, critical: 0 };
    for (const v of violations) {
      if (v.impact !== 'unknown') counts[v.impact] += 1;
    }

    return {
      label,
      url: typeof raw.url === 'string' ? raw.url : this.page.url(),
      timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
      violations,
      passCount: raw.passes.length,
      incompleteCount: raw.incomplete.length,
      inapplicableCount: raw.inapplicable.length,
      counts,
      raw,
    };
  }

  private toViolation(result: Result): A11yViolation {
    const nodes: A11yViolationNode[] = result.nodes.map((node) => ({
      html: node.html,
      target: stringifyTarget(node.target),
      failureSummary: node.failureSummary ?? '',
    }));
    return {
      id: result.id,
      impact: normaliseImpact(result.impact),
      description: result.description,
      help: result.help,
      helpUrl: result.helpUrl,
      tags: result.tags,
      nodes,
    };
  }
}
