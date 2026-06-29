/**
 * --------------------------------------------------------
 * File: interception.spec.ts
 * Module: Network Tests · Interception & Timing
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: NetworkManager request interception, latency injection,
 *                     selective mocking, and large-payload handling.
 * Business Scenario: Tests must inspect/shape individual requests and simulate
 *                    slow links without touching unrelated traffic.
 * Preconditions: A real origin for same-origin fetches (SauceDemo).
 * Test Strategy: Drive the real browser network stack via the `network` fixture.
 * Expected Outcome: Latency is observable; interception inspects requests;
 *                   only matched routes are stubbed; large bodies round-trip.
 * Priority: Medium
 * Tags: @network @regression
 *
 * Last Updated: 2026-06-28
 * Notes: Complements route-mocking.spec.ts (mock/abort/capture/HAR).
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

const ORIGIN = 'https://www.saucedemo.com/';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('NetworkManager · Interception & timing @network @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
  });

  test('@smoke delay injects observable latency', async ({ network, page }) => {
    await network.intercept('**/api/slow-json', async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    const elapsed = await page.evaluate(async () => {
      const start = performance.now();
      await fetch('/api/slow-json');
      return performance.now() - start;
    });
    expect(elapsed).toBeGreaterThan(600);
  });

  test('interception can inspect the request method and url', async ({ network, page }) => {
    let seenMethod = '';
    let seenUrl = '';
    await network.intercept('**/api/inspect**', async (route, request) => {
      seenMethod = request.method();
      seenUrl = request.url();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.evaluate(async () => {
      await fetch('/api/inspect?id=42', { method: 'GET' });
    });
    expect(seenMethod).toBe('GET');
    expect(seenUrl).toContain('id=42');
  });

  test('selective mocking leaves unrelated routes untouched', async ({ network, page }) => {
    await network.mockJson('**/api/mocked', { mocked: true });

    const result = await page.evaluate(async () => {
      const mocked = await (await fetch('/api/mocked')).json();
      // A different, un-mocked path hits the real server (404 here, not the stub).
      const realStatus = (await fetch('/api/not-mocked')).status;
      return { mocked, realStatus };
    });
    expect(result.mocked).toEqual({ mocked: true });
    expect(result.realStatus).not.toBe(200);
  });

  test('a large payload round-trips through a mock', async ({ network, page }) => {
    const big = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `item-${i}` }));
    await network.mockJson('**/api/large', big);

    const length = await page.evaluate(async () => {
      const data = await (await fetch('/api/large')).json();
      return data.length;
    });
    expect(length).toBe(1000);
  });
});
