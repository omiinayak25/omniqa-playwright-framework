/**
 * --------------------------------------------------------
 * File: logging.spec.ts
 * Module: API Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Logging infrastructure (correlation id + log capture).
 * Business Scenario: Logs must carry a stable correlation id and be capturable per test.
 * Preconditions: autoLog fixture active; no network or browser required.
 * Test Strategy: Infrastructure self-test across async context boundaries.
 * Expected Outcome: Correlation id survives awaits; capture buffer collects tagged logs.
 * Priority: Medium
 * Tags: @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Logging infrastructure tests — correlation-id propagation through async
 * context and per-test log capture. Tagged @smoke.
 */
import { test, expect } from '@fixtures/index';
import { currentCorrelationId, runWithLogContext } from '@utils/log-context';
import { beginCapture, endCapture } from '@utils/log-capture';
import { logger } from '@utils/logger';

test.describe('Logging · correlation & capture @smoke', () => {
  test('correlation id is present and stable across awaits', async () => {
    const id = currentCorrelationId();
    expect(id).toBeDefined();
    expect(id).toHaveLength(8); // set by the autoLog fixture
    await new Promise((r) => setTimeout(r, 5));
    expect(currentCorrelationId()).toBe(id); // survives the await boundary
  });

  test('capture buffer collects logs tagged with the active correlation id', async () => {
    const id = 'unit-capture-001';
    await runWithLogContext({ correlationId: id }, async () => {
      beginCapture(id);
      logger.info('captured line one');
      logger.warn('captured line two');
    });
    const lines = endCapture(id);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines.join('\n')).toContain('captured line one');
    expect(lines.join('\n')).toContain('captured line two');
  });
});
