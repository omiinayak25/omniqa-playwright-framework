/**
 * --------------------------------------------------------
 * File: login.a11y.spec.ts
 * Module: Accessibility Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: SauceDemo login screen — WCAG 2.1 A/AA compliance.
 * Business Scenario: The first screen every user sees must be operable by
 *   assistive technology and keyboard users.
 * Preconditions: Clean (logged-out) session; network access to SauceDemo.
 * Test Strategy: axe-core scan via the injected `a11y` assertions, plus
 *   real keyboard-operability checks via the `keyboard` navigator.
 * Expected Outcome: Zero violations across the page and each focused concern
 *   (alt text, labels, contrast, ARIA); all controls reachable by keyboard.
 * Priority: High
 * Tags: @a11y @accessibility @regression @smoke
 *
 * Last Updated: 2026-06-27
 * Notes:
 * The accessibility project runs WITHOUT stored auth, but we still force a
 * clean storage state so the scan always targets the logged-out login screen.
 * Assertions live HERE; the page object only navigates.
 * --------------------------------------------------------
 */
import { test } from '@fixtures/index';

// An accessibility audit of the login screen must run logged-out.
test.use({ storageState: { cookies: [], origins: [] } });

const SCREEN = 'SauceDemo · Login';

test.describe('SauceDemo · Login · Accessibility @a11y @accessibility @regression', () => {
  test.beforeEach(async ({ sauceLoginPage }) => {
    await sauceLoginPage.open();
  });

  test('@smoke login screen has no WCAG 2.1 A/AA violations', async ({ a11y }) => {
    await a11y.expectNoViolations(SCREEN);
  });

  test('every form control is programmatically labeled', async ({ a11y }) => {
    await a11y.expectAllFieldsLabeled(`${SCREEN} · labels`);
  });

  test('no images are missing alternative text', async ({ a11y }) => {
    await a11y.expectNoAltTextIssues(`${SCREEN} · alt-text`);
  });

  test('text meets the WCAG AA colour-contrast ratio', async ({ a11y }) => {
    await a11y.expectSufficientColorContrast(`${SCREEN} · contrast`);
  });

  test('ARIA roles, states and properties are valid', async ({ a11y }) => {
    await a11y.expectValidAria(`${SCREEN} · aria`);
  });

  test('login controls are operable in the expected keyboard focus order', async ({ a11y }) => {
    // SauceDemo exposes a simple, predictable tab order on the login form.
    await a11y.expectFocusOrder(['#user-name', '#password', '#login-button']);
  });

  test('the login button is reachable using only the Tab key', async ({ a11y }) => {
    await a11y.expectReachableByTab('#login-button');
  });
});
