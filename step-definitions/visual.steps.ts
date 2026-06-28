/**
 * --------------------------------------------------------
 * File: visual.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo visual BDD steps (baseline + stability + masks).
 * Business Scenario: Gherkin visual scenarios capture stabilised screenshots and
 *                    manage a baseline, reusing the framework's freeze CSS + masks.
 * Preconditions: On the SauceDemo login page (Background reuses an Auth step).
 * Test Strategy: page.screenshot (works in Cucumber) + dynamic-element masks.
 * Priority: Medium
 * Tags: (driven by features/visual/visual.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * Cucumber has no `toHaveScreenshot` (a Playwright-runner matcher), so these
 * steps capture via page.screenshot — reusing the SAME freeze stylesheet and
 * dynamic-region masking the Playwright VisualComparator uses. `this` is World.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { toMaskLocators, DYNAMIC_SELECTORS } from '@visual/dynamic-elements';
import type { CustomWorld } from '@bdd/world';

// Reuse the framework's stabilisation stylesheet and a committed baseline dir.
const FREEZE_CSS = path.resolve(process.cwd(), 'src', 'visual', 'screenshot.css');
const BASELINE_DIR = path.resolve(process.cwd(), 'visual-baselines', 'bdd');

async function capture(
  world: CustomWorld,
  options: { fullPage?: boolean; maskSelectors?: readonly string[] } = {},
): Promise<Buffer> {
  const { page } = world;
  // Wait for fonts so glyphs render identically run-to-run.
  await page.evaluate(async () => {
    if (document.fonts !== undefined) await document.fonts.ready;
  }).catch(() => undefined);
  return page.screenshot({
    fullPage: options.fullPage ?? true,
    animations: 'disabled',
    caret: 'hide',
    style: fs.readFileSync(FREEZE_CSS, 'utf-8'),
    mask: toMaskLocators(page, options.maskSelectors ?? []),
  });
}

// ------------------------------------------------------------------- actions
When('I capture the login page as the {string} baseline', async function (this: CustomWorld, name: string) {
  const shot = await capture(this);
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const file = path.join(BASELINE_DIR, `${name}.png`);
  // First run establishes the baseline; later runs keep the committed one.
  if (!fs.existsSync(file)) fs.writeFileSync(file, shot);
  this.attach(shot, 'image/png');
});

When('I capture the login page twice', async function (this: CustomWorld) {
  this.set('shotA', await capture(this));
  this.set('shotB', await capture(this));
});

When('I capture the login page masking dynamic regions', async function (this: CustomWorld) {
  const shot = await capture(this, { maskSelectors: [...DYNAMIC_SELECTORS.COMMON] });
  this.set('maskedShot', shot);
  this.attach(shot, 'image/png');
});

// ---------------------------------------------------------------- assertions
Then('a visual baseline should exist for {string}', function (this: CustomWorld, name: string) {
  const file = path.join(BASELINE_DIR, `${name}.png`);
  expect(fs.existsSync(file)).toBe(true);
  expect(fs.statSync(file).size).toBeGreaterThan(0);
});

Then('both captures should be pixel-identical', function (this: CustomWorld) {
  const a = this.get<Buffer>('shotA');
  const b = this.get<Buffer>('shotB');
  this.attach(a, 'image/png');
  expect(Buffer.compare(a, b)).toBe(0);
});

Then('a masked capture should be produced', function (this: CustomWorld) {
  expect(this.get<Buffer>('maskedShot').length).toBeGreaterThan(0);
});
