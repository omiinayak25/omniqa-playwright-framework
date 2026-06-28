/**
 * --------------------------------------------------------
 * File: edge-input.factory.ts
 * Module: Factories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Centralized, reusable adversarial/edge-case input datasets — XSS, SQL
 * injection, whitespace, unicode, boundary-length, and empty variants. One
 * source of truth so UI, API, and DB security/negative tests share the SAME
 * payloads instead of re-declaring literals per spec (DRY + consistency).
 *
 * Responsibilities:
 * - Provide named payload groups (xss / sqlInjection / whitespace / unicode)
 * - Provide parameterised generators (longString, control characters)
 * - Stay assertion-free; tests decide expected behaviour per surface
 *
 * Used By:
 * Authentication / Search / Forms / Checkout / Security / API negative specs.
 *
 * Dependencies:
 * None (pure data) — keeps the payloads deterministic and review-friendly.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Payloads are intentionally well-known, non-destructive probes. They assert
 * that input is treated as inert data, never executed or trusted.
 * --------------------------------------------------------
 */

/** A labelled adversarial input — `label` drives readable test titles. */
export interface EdgeInput {
  readonly label: string;
  readonly value: string;
}

/** Reusable adversarial / boundary input datasets for negative & security tests. */
export class EdgeInputFactory {
  /** Classic reflected/stored XSS probes. Expected: rendered as inert text. */
  public static xss(): readonly EdgeInput[] {
    return [
      { label: 'script tag', value: '<script>alert(1)</script>' },
      { label: 'img onerror', value: '<img src=x onerror=alert(1)>' },
      { label: 'svg onload', value: '<svg/onload=alert(1)>' },
      { label: 'javascript: uri', value: 'javascript:alert(1)' },
      { label: 'attribute breakout', value: '" onmouseover="alert(1)' },
    ];
  }

  /** Classic SQL-injection probes. Expected: no auth bypass, no 500, no leak. */
  public static sqlInjection(): readonly EdgeInput[] {
    return [
      { label: 'or-1=1 comment', value: "' OR '1'='1' --" },
      { label: 'admin comment', value: "admin'--" },
      { label: 'union select', value: "' UNION SELECT NULL--" },
      { label: 'drop table', value: "'; DROP TABLE users; --" },
      { label: 'boolean tautology', value: '" OR 1=1 #' },
    ];
  }

  /** Whitespace variants — assert inputs are NOT silently trimmed/accepted. */
  public static whitespace(): readonly EdgeInput[] {
    return [
      { label: 'leading spaces', value: '   standard_user' },
      { label: 'trailing spaces', value: 'standard_user   ' },
      { label: 'tabs', value: '\tstandard_user\t' },
      { label: 'spaces only', value: '     ' },
    ];
  }

  /** Unicode / multi-byte inputs — assert graceful handling, no crash. */
  public static unicode(): readonly EdgeInput[] {
    return [
      { label: 'accented latin', value: 'üsér_ñame' },
      { label: 'cjk', value: '用户名测试' },
      { label: 'emoji', value: 'user😀name' },
      { label: 'rtl arabic', value: 'مستخدم' },
    ];
  }

  /** A string of `length` repeated chars — boundary/overflow probing. */
  public static longString(length: number, char = 'a'): string {
    return char.repeat(Math.max(0, length));
  }

  /** Empty / blank credential combinations for required-field validation. */
  public static emptyCredentialPairs(): ReadonlyArray<{
    readonly label: string;
    readonly username: string;
    readonly password: string;
  }> {
    return [
      { label: 'both empty', username: '', password: '' },
      { label: 'empty username', username: '', password: 'secret_sauce' },
      { label: 'empty password', username: 'standard_user', password: '' },
    ];
  }
}
