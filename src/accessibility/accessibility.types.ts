/**
 * --------------------------------------------------------
 * File: accessibility.types.ts
 * Module: Accessibility
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Type contracts and rule/tag catalogues for the accessibility (axe-core)
 * layer. A single typed surface so the scanner, assertions, reporter, and
 * tests all speak the same shapes (no `any`, no magic strings in specs).
 *
 * Responsibilities:
 * - Define WCAG tag and impact unions, plus their ordering.
 * - Define the normalised, framework-owned scan result/violation shapes
 *   (decoupled from axe-core's raw types so reports stay stable).
 * - Provide curated rule-sets for focused checks (alt text, labels,
 *   contrast, ARIA) so semantic assertions are not stringly-typed.
 *
 * Used By:
 * accessibility-scanner.ts, accessibility-assertions.ts,
 * accessibility-reporter.ts, and the tests/accessibility specs.
 *
 * Dependencies:
 * axe-core (AxeResults / ImpactValue / RunOptions types only — no runtime).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * We deliberately normalise axe-core's verbose result into a flat, readable
 * `A11yScanResult`. Tests and reports depend on OUR shape, so an axe-core
 * upgrade can never silently break a report or a spec assertion.
 * --------------------------------------------------------
 */
import type { AxeResults, ImpactValue, RunOptions } from 'axe-core';

/**
 * WCAG / best-practice tag groups understood by axe-core. The trailing
 * `(string & {})` keeps editor autocomplete for the known tags while still
 * allowing any custom axe tag without losing type-safety elsewhere.
 */
export type WcagTag =
  | 'wcag2a'
  | 'wcag2aa'
  | 'wcag2aaa'
  | 'wcag21a'
  | 'wcag21aa'
  | 'wcag22aa'
  | 'best-practice'
  | 'section508'
  | 'ACT'
  // `string & Record<never, never>` keeps literal autocomplete while allowing
  // any custom tag (the lint-safe form of the `string & {}` idiom).
  | (string & Record<never, never>);

/**
 * Default tag set applied when a scan does not specify one: WCAG 2.0 + 2.1,
 * levels A and AA — the de-facto enterprise compliance baseline.
 */
export const DEFAULT_WCAG_TAGS: readonly WcagTag[] = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Non-null axe impact (a violation always carries one of these, or unknown). */
export type A11yImpact = NonNullable<ImpactValue>;

/** A violation whose impact axe-core could not classify. */
export type A11yImpactOrUnknown = A11yImpact | 'unknown';

/** Severity ranking so callers can gate on "fail above `serious`", etc. */
export const IMPACT_ORDER: Readonly<Record<A11yImpact, number>> = {
  minor: 1,
  moderate: 2,
  serious: 3,
  critical: 4,
};

/** Curated axe-core rule ids grouped by the concern a spec wants to assert. */
export const RULE_SETS = {
  /** Missing / empty alternative text across images, inputs, svg, areas. */
  ALT_TEXT: [
    'image-alt',
    'input-image-alt',
    'area-alt',
    'role-img-alt',
    'svg-img-alt',
    'object-alt',
  ],
  /** Form controls must have a programmatic, non-ambiguous label. */
  FORM_LABELS: [
    'label',
    'label-title-only',
    'form-field-multiple-labels',
    'select-name',
    'aria-input-field-name',
  ],
  /** Text/UI contrast against its background (WCAG 1.4.3). */
  COLOR_CONTRAST: ['color-contrast'],
  /** ARIA roles, states, and properties are valid and allowed. */
  ARIA: [
    'aria-allowed-attr',
    'aria-allowed-role',
    'aria-required-attr',
    'aria-required-children',
    'aria-required-parent',
    'aria-roles',
    'aria-valid-attr',
    'aria-valid-attr-value',
    'aria-hidden-body',
    'aria-hidden-focus',
    'aria-command-name',
    'aria-toggle-field-name',
    'aria-input-field-name',
    'aria-meter-name',
    'aria-progressbar-name',
    'aria-tooltip-name',
  ],
} as const satisfies Readonly<Record<string, readonly string[]>>;

/** Options accepted by a single accessibility scan. All optional. */
export interface A11yScanOptions {
  /** WCAG/best-practice tags to run (defaults to {@link DEFAULT_WCAG_TAGS}). */
  readonly tags?: readonly WcagTag[];
  /**
   * Restrict the scan to these specific rule ids. When provided this takes
   * precedence over `tags` (axe-core runs EITHER tags OR explicit rules).
   */
  readonly rules?: readonly string[];
  /** Limit the scan to one or more CSS selectors (e.g. a single form). */
  readonly include?: string | readonly string[];
  /** Exclude one or more CSS selectors (e.g. a known third-party widget). */
  readonly exclude?: string | readonly string[];
  /** Rule ids to switch OFF for this scan (documented, intentional waivers). */
  readonly disableRules?: readonly string[];
  /** Raw axe-core run options escape hatch (rarely needed). */
  readonly runOptions?: RunOptions;
}

/** One offending DOM node within a violation, flattened for reporting. */
export interface A11yViolationNode {
  /** Outer HTML of the offending element (truncated by axe-core). */
  readonly html: string;
  /** CSS selector path to the element. */
  readonly target: string;
  /** Human-readable explanation of why this node failed. */
  readonly failureSummary: string;
}

/** A single accessibility rule violation, normalised from axe-core. */
export interface A11yViolation {
  /** axe-core rule id (e.g. `color-contrast`). */
  readonly id: string;
  /** Severity, or `unknown` when axe-core did not classify it. */
  readonly impact: A11yImpactOrUnknown;
  /** Short description of the rule. */
  readonly description: string;
  /** Remediation guidance. */
  readonly help: string;
  /** Deque docs URL with the full explanation + fix. */
  readonly helpUrl: string;
  /** WCAG / best-practice tags the rule belongs to. */
  readonly tags: readonly string[];
  /** Every DOM node that violated the rule. */
  readonly nodes: readonly A11yViolationNode[];
}

/** The framework-owned, report-stable result of one accessibility scan. */
export interface A11yScanResult {
  /** URL that was scanned. */
  readonly url: string;
  /** Human label for the scanned screen/state (e.g. `SauceDemo · Login`). */
  readonly label: string;
  /** ISO timestamp the scan completed. */
  readonly timestamp: string;
  /** All violations found. */
  readonly violations: readonly A11yViolation[];
  /** Number of passing rule checks. */
  readonly passCount: number;
  /** Checks axe-core could not decide (needs human review). */
  readonly incompleteCount: number;
  /** Rules not applicable to the page. */
  readonly inapplicableCount: number;
  /** Violation count bucketed by impact. */
  readonly counts: Readonly<Record<A11yImpact, number>>;
  /** The untouched axe-core result, kept for deep debugging/attachments. */
  readonly raw: AxeResults;
}
