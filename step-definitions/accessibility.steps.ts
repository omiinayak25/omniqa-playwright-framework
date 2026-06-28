/**
 * --------------------------------------------------------
 * File: accessibility.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo accessibility BDD steps (scan + keyboard).
 * Business Scenario: Gherkin a11y scenarios drive the axe-core scanner and the
 *                    keyboard navigator against the current page.
 * Preconditions: On the SauceDemo login page (Background reuses an Auth step).
 * Test Strategy: BDD glue reusing AccessibilityScanner + KeyboardNavigator.
 * Priority: High
 * Tags: (driven by features/accessibility/accessibility.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * The high-level AccessibilityAssertions class needs a Playwright TestInfo-bound
 * reporter, which Cucumber doesn't provide — so these steps use the SAME scanner
 * and keyboard navigator directly. `this` is the per-scenario CustomWorld.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AccessibilityScanner } from '@accessibility/accessibility-scanner';
import { KeyboardNavigator } from '@accessibility/keyboard-navigator';
import type { A11yScanResult } from '@accessibility/accessibility.types';
import type { CustomWorld } from '@bdd/world';

const scanner = (world: CustomWorld): AccessibilityScanner => new AccessibilityScanner(world.page);
const keyboard = (world: CustomWorld): KeyboardNavigator => new KeyboardNavigator(world.page);

// ---------------------------------------------------------------- scan steps
Then('the page should have no accessibility violations', async function (this: CustomWorld) {
  const result = await scanner(this).scanWcag('BDD · full WCAG');
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
});

Then('the page should have no ARIA accessibility violations', async function (this: CustomWorld) {
  const result = await scanner(this).scanAria('BDD · ARIA');
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
});

Then('the page text should meet colour-contrast requirements', async function (this: CustomWorld) {
  const result = await scanner(this).scanColorContrast('BDD · contrast');
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
});

Then('every form field should have an accessible label', async function (this: CustomWorld) {
  const result = await scanner(this).scanFormLabels('BDD · labels');
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
});

Then('no image should be missing alternative text', async function (this: CustomWorld) {
  const result = await scanner(this).scanAltText('BDD · alt-text');
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toHaveLength(0);
});

// ------------------------------------------------------------ keyboard steps
Then(
  'the login button should be reachable using only the keyboard',
  async function (this: CustomWorld) {
    expect(await keyboard(this).isReachableByTab('#login-button')).toBe(true);
  },
);

Then(
  'the keyboard focus order should be username, password, then the login button',
  async function (this: CustomWorld) {
    const order = await keyboard(this).captureFocusOrder(3);
    expect(order.map((f) => f.id)).toEqual(['user-name', 'password', 'login-button']);
  },
);

// -------------------------------------------------------------- report steps
When('I run an accessibility scan', async function (this: CustomWorld) {
  const result = await scanner(this).scanWcag('BDD · report');
  this.set('a11yResult', result);
  // Attach the scan summary to the Cucumber report (the BDD "report" artifact).
  this.attach(
    JSON.stringify(
      { url: result.url, passCount: result.passCount, violations: result.violations },
      null,
      2,
    ),
    'application/json',
  );
});

Then('the scan report should list zero violations', function (this: CustomWorld) {
  expect(this.get<A11yScanResult>('a11yResult').violations).toHaveLength(0);
});
