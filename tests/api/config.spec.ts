/**
 * --------------------------------------------------------
 * File: config.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Singleton configuration facade (env, URLs, DB, constants).
 * Business Scenario: Config must resolve a valid environment and typed values.
 * Preconditions: Loaded app configuration; no network or browser required.
 * Test Strategy: Infrastructure self-test of the config facade and constants.
 * Expected Outcome: Environment, base URLs, DB port, and constants are valid.
 * Priority: Medium
 * Tags: @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Configuration layer validation.
 * Proves the Singleton Config Facade loads, validates, and exposes typed values.
 * Tagged @smoke. (Replaced/extended by real suites in later phases.)
 */
import { test, expect } from '@fixtures/index';
import { config } from '@config/config';
import { AppEnvironment } from '@config/env';
import { HttpStatus, TIMEOUTS } from '@constants/index';

test.describe('Configuration facade @smoke', () => {
  test('resolves a valid environment', () => {
    expect(Object.values(AppEnvironment)).toContain(config.environment);
  });

  test('exposes valid UI + API base URLs', () => {
    expect(config.ui.sauceDemo.baseUrl).toMatch(/^https?:\/\//);
    expect(config.api.dummyJson.baseUrl).toMatch(/^https?:\/\//);
  });

  test('database config has a sane port', () => {
    expect(config.database.port).toBeGreaterThan(0);
    expect(config.database.port).toBeLessThanOrEqual(65_535);
  });

  test('constants are wired (enums + timeouts)', () => {
    expect(HttpStatus.OK).toBe(200);
    expect(TIMEOUTS.LONG).toBe(30_000);
  });
});
