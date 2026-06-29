/**
 * --------------------------------------------------------
 * File: fixtures.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Custom Playwright fixtures / dependency injection.
 * Business Scenario: Framework fixtures (config, data, log) must inject reliably.
 * Preconditions: Loaded app configuration; no network or browser required.
 * Test Strategy: Infrastructure self-test of injected fixtures.
 * Expected Outcome: Worker + test fixtures are present and usable.
 * Priority: Medium
 * Tags: @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Fixture / Dependency-Injection validation.
 * Proves custom fixtures inject correctly and the auto-log fixture runs.
 * Tagged @smoke.
 */
import { test, expect } from '@fixtures/index';
import { AppEnvironment } from '@config/env';

test.describe('Custom fixtures (DI) @smoke', () => {
  test('appConfig (worker fixture) is injected', ({ appConfig }) => {
    expect(Object.values(AppEnvironment)).toContain(appConfig.environment);
    expect(appConfig.ui.sauceDemo.baseUrl).toMatch(/^https?:\/\//);
  });

  test('data fixture generates isolated test data', ({ data }) => {
    expect(data.email()).toMatch(/@/);
    expect(data.uuid()).toMatch(/^[0-9a-f-]{36}$/i);
    const n = data.int(1, 3);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(3);
  });

  test('log fixture is a usable scoped logger', ({ log }) => {
    expect(typeof log.info).toBe('function');
    log.info('hello from the log fixture');
  });

  test('workerLogger fixture is injected', ({ workerLogger }) => {
    expect(typeof workerLogger.info).toBe('function');
  });
});
