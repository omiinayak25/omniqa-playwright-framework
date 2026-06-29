/**
 * --------------------------------------------------------
 * File: sanity.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Toolchain wiring (Playwright + TypeScript + path aliases).
 * Business Scenario: The test harness itself must be correctly configured.
 * Preconditions: Loaded environment selector; no browser/network required.
 * Test Strategy: Smoke sanity check of the toolchain and env resolution.
 * Expected Outcome: Basic assertions pass and the active env is recognized.
 * Priority: Low
 * Tags: @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Sanity check — validates the Playwright + TypeScript + path-alias toolchain.
 * Runs under the `api` project (no browser needed). Tagged @smoke.
 * Will be replaced by real API tests in Phase 10.
 */
import { test, expect } from '@fixtures/index';
import { ACTIVE_ENV, AppEnvironment } from '@config/env';

test.describe('Framework sanity @smoke', () => {
  test('toolchain is wired correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('environment selector resolves to a known environment', () => {
    const known = Object.values(AppEnvironment);
    expect(known).toContain(ACTIVE_ENV);
  });
});
