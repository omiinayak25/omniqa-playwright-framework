/**
 * --------------------------------------------------------
 * File: route-mocking.spec.ts
 * Module: Network Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: NetworkManager — route mocking, abortion, custom
 *   responses, traffic capture, and HAR replay.
 * Business Scenario: Tests must control backend responses deterministically
 *   (edge cases, error states, offline) without depending on a live backend.
 * Preconditions: A real origin to host same-origin fetches (SauceDemo).
 * Test Strategy: Drive the real browser network stack via the `network`
 *   fixture and assert in-page fetch results reflect the configured routes.
 * Expected Outcome: Mocks/aborts/HAR-replay deterministically shape responses.
 * Priority: Medium
 * Tags: @network @regression
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Same-origin fetches against saucedemo.com exercise the genuine routing path
 * (not a stub), so these prove the manager end-to-end. The HAR fixture lets a
 * route be served entirely from a recorded archive (offline determinism).
 * --------------------------------------------------------
 */
import * as path from 'node:path';
import { test, expect } from '@fixtures/index';

const ORIGIN = 'https://www.saucedemo.com/';
const HAR = path.join(__dirname, 'fixtures', 'sample.har');

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('NetworkManager · Route control @network @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
  });

  test('@smoke mockJson stubs a same-origin endpoint', async ({ network, page }) => {
    await network.mockJson('**/api/user', { name: 'Mock User', role: 'admin' });

    const body = await page.evaluate(async () => {
      const res = await fetch('/api/user');
      return res.json();
    });
    expect(body).toEqual({ name: 'Mock User', role: 'admin' });
  });

  test('mock serves a custom status code and text body', async ({ network, page }) => {
    await network.mock('**/api/health', { status: 503, body: 'down', contentType: 'text/plain' });

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/health');
      return { status: res.status, text: await res.text() };
    });
    expect(result.status).toBe(503);
    expect(result.text).toBe('down');
  });

  test('abort blocks matching requests (simulates network failure)', async ({ network, page }) => {
    await network.abort('**/blocked/**');

    const reachable = await page.evaluate(async () => {
      try {
        await fetch('/blocked/resource');
        return true;
      } catch {
        return false;
      }
    });
    expect(reachable).toBe(false);
  });

  test('capture records request/response traffic', async ({ network, page }) => {
    network.startCapture();
    await page.reload({ waitUntil: 'domcontentloaded' });

    expect(network.traffic.length).toBeGreaterThan(0);
    expect(network.traffic.every((r) => typeof r.url === 'string')).toBe(true);
  });

  test('replayFromHar serves a route entirely from a recorded archive', async ({
    network,
    page,
  }) => {
    await network.replayFromHar(HAR, '**/api/har-user');

    const body = await page.evaluate(async () => {
      const res = await fetch('/api/har-user');
      return res.json();
    });
    expect(body).toEqual({ source: 'har', id: 7 });
  });
});
