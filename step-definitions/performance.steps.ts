/**
 * --------------------------------------------------------
 * File: performance.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: SauceDemo performance BDD steps (load/TTFB/resources/budget).
 * Business Scenario: Gherkin perf scenarios collect timings and gate them on a budget.
 * Preconditions: On the SauceDemo login page (Background reuses an Auth step).
 * Test Strategy: BDD glue reusing PerformanceCollector + the configured budget.
 * Priority: Medium
 * Tags: (driven by features/performance/performance.feature)
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 *
 * The high-level PerformanceAssertions needs a Playwright TestInfo-bound
 * reporter (absent in Cucumber), so these steps use the SAME PerformanceCollector
 * directly and gate metrics against config.performance.budget. `this` is World.
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PerformanceCollector } from '@performance/performance-collector';
import type { PerformanceMetrics } from '@apptypes/index';
import { config } from '@config/config';
import type { CustomWorld } from '@bdd/world';

const metrics = (world: CustomWorld): PerformanceMetrics => world.get<PerformanceMetrics>('perf');

// ------------------------------------------------------------------- measure
When('I measure the login page performance', async function (this: CustomWorld) {
  await this.page.waitForLoadState('load');
  const result = await new PerformanceCollector(this.page).collect('BDD · login');
  this.set('perf', result);
  this.attach(JSON.stringify(result, null, 2), 'application/json');
});

// ---------------------------------------------------------------- assertions
Then('the page should load within {int} ms', function (this: CustomWorld, ms: number) {
  expect(metrics(this).loadMs).toBeLessThanOrEqual(ms);
});

Then('the time to first byte should be under {int} ms', function (this: CustomWorld, ms: number) {
  expect(metrics(this).ttfbMs).toBeLessThanOrEqual(ms);
});

Then('the page should request at least {int} resource', function (this: CustomWorld, count: number) {
  expect(metrics(this).resources.count).toBeGreaterThanOrEqual(count);
});

Then(
  'the total transferred size should be under {int} kilobytes',
  function (this: CustomWorld, kb: number) {
    expect(metrics(this).resources.transferBytes).toBeLessThanOrEqual(kb * 1024);
  },
);

Then('a per-resource-type breakdown should be available', function (this: CustomWorld) {
  expect(metrics(this).resources.byType.length).toBeGreaterThan(0);
});

Then('the page should load within the configured performance budget', function (this: CustomWorld) {
  const m = metrics(this);
  const b = config.performance.budget;
  const violations: string[] = [];
  const check = (name: string, actual: number, max: number): void => {
    if (actual > max) violations.push(`${name}: ${actual} > ${max}`);
  };
  check('loadMs', m.loadMs, b.maxLoadMs);
  check('domContentLoadedMs', m.domContentLoadedMs, b.maxDomContentLoadedMs);
  check('ttfbMs', m.ttfbMs, b.maxTtfbMs);
  check('fcpMs', m.fcpMs, b.maxFcpMs);
  check('lcpMs', m.lcpMs, b.maxLcpMs);
  check('transferBytes', m.resources.transferBytes, b.maxTransferBytes);
  check('resourceCount', m.resources.count, b.maxResourceCount);
  expect(violations, violations.join('; ')).toHaveLength(0);
});
