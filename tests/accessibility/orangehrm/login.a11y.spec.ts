/**
 * --------------------------------------------------------
 * File: login.a11y.spec.ts
 * Module: Accessibility Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM login screen accessibility (Angular SPA).
 * Business Scenario: The HR portal's entry screen must meet a defined a11y
 *   quality gate; pre-existing vendor gaps are detected and triaged, never
 *   silently ignored.
 * Preconditions: Network access to the OrangeHRM open-source demo.
 * Test Strategy: Detection of real serious violations, a "no critical"
 *   quality gate, a triaged-waiver baseline, plus clean focused concerns
 *   (labels, ARIA) and keyboard operability.
 * Expected Outcome: Known serious issues (contrast, html-has-lang, link-name)
 *   are surfaced; no CRITICAL issues; labels/ARIA pass; submit is keyboard-
 *   reachable.
 * Priority: High
 * Tags: @a11y @accessibility @regression
 *
 * Last Updated: 2026-06-27
 * Notes:
 * The OrangeHRM demo carries known serious findings. We assert they are
 * detected (so a regression to WORSE is caught), enforce a "block criticals"
 * gate, and keep a documented-waiver baseline green — the realistic way mature
 * teams adopt accessibility on a legacy/vendor app.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

const SCREEN = 'OrangeHRM · Login';
/** Known, triaged vendor gaps on the demo's login screen. */
const KNOWN_WAIVERS = ['color-contrast', 'html-has-lang', 'link-name'];

test.describe('OrangeHRM · Login · Accessibility @a11y @accessibility @regression', () => {
  test.beforeEach(async ({ orangeLoginPage }) => {
    await orangeLoginPage.open();
    expect(await orangeLoginPage.isLoaded()).toBe(true);
  });

  test('the scanner detects the known serious violations', async ({
    a11yScanner,
    a11yReporter,
  }) => {
    const result = await a11yScanner.scanWcag(`${SCREEN} · detection`);
    await a11yReporter.record(result);

    const ids = result.violations.map((v) => v.id);
    expect(ids).toContain('color-contrast');
    expect(ids).toContain('link-name');
  });

  test('@smoke login screen has no CRITICAL accessibility violations', async ({
    a11yScanner,
    a11yReporter,
    a11y,
  }) => {
    // Quality gate: serious issues are tracked as waivers, but a CRITICAL
    // regression must fail the build immediately.
    const result = await a11yScanner.scanWcag(`${SCREEN} · critical-gate`);
    await a11yReporter.record(result);
    a11y.expectNoViolationsAbove(result, 'critical');
  });

  test('login screen is compliant apart from triaged waivers', async ({ a11y }) => {
    await a11y.expectNoViolations(`${SCREEN} · baseline`, { disableRules: KNOWN_WAIVERS });
  });

  test('every login form control is programmatically labeled', async ({ a11y }) => {
    await a11y.expectAllFieldsLabeled(`${SCREEN} · labels`);
  });

  test('ARIA roles, states and properties are valid', async ({ a11y }) => {
    await a11y.expectValidAria(`${SCREEN} · aria`);
  });

  test('the submit button is reachable using only the Tab key', async ({ a11y }) => {
    await a11y.expectReachableByTab('button[type="submit"]');
  });
});
