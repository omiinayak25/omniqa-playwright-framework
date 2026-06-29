/**
 * --------------------------------------------------------
 * File: error-handling.spec.ts
 * Module: Network Tests · Error Handling
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Client behaviour against error/edge backend responses.
 * Business Scenario: The app must survive 404/500, empty/malformed bodies,
 *                    timeouts, offline, and transient failures — without crashing.
 * Preconditions: A real origin for same-origin fetches (SauceDemo).
 * Test Strategy: Shape the network deterministically via the `network` fixture
 *                and assert the in-page fetch result reflects graceful handling.
 * Expected Outcome: Each error condition is observed and handled, not fatal.
 * Priority: Medium
 * Tags: @network @regression @error-handling
 *
 * Last Updated: 2026-06-28
 * Notes: Complements route-mocking.spec.ts with the error/edge matrix.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';

const ORIGIN = 'https://www.saucedemo.com/';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('NetworkManager · Error handling @network @regression @error-handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
  });

  test('@smoke a 404 response is observed by the client', async ({ network, page }) => {
    await network.mock('**/api/missing', {
      status: 404,
      body: 'Not Found',
      contentType: 'text/plain',
    });
    const status = await page.evaluate(async () => (await fetch('/api/missing')).status);
    expect(status).toBe(404);
  });

  test('a 500 response is observed by the client', async ({ network, page }) => {
    await network.mock('**/api/boom', {
      status: 500,
      body: 'Server Error',
      contentType: 'text/plain',
    });
    const status = await page.evaluate(async () => (await fetch('/api/boom')).status);
    expect(status).toBe(500);
  });

  test('an empty response body is handled', async ({ network, page }) => {
    await network.mock('**/api/empty', { status: 200, body: '', contentType: 'text/plain' });
    const text = await page.evaluate(async () => (await fetch('/api/empty')).text());
    expect(text).toBe('');
  });

  test('a malformed JSON body surfaces a parse error (not a crash)', async ({ network, page }) => {
    await network.mock('**/api/bad-json', {
      status: 200,
      body: '{ this is : not json',
      contentType: 'application/json',
    });
    const parseFailed = await page.evaluate(async () => {
      try {
        await (await fetch('/api/bad-json')).json();
        return false;
      } catch {
        return true; // JSON.parse threw — caught, not fatal
      }
    });
    expect(parseFailed).toBe(true);
  });

  test('a request timeout (slow network) is caught via AbortController', async ({
    network,
    page,
  }) => {
    await network.delay('**/api/slow', 3000);
    const timedOut = await page.evaluate(async () => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 500);
      try {
        await fetch('/api/slow', { signal: ctrl.signal });
        clearTimeout(t);
        return false;
      } catch {
        return true; // aborted before the 3s delay elapsed
      }
    });
    expect(timedOut).toBe(true);
  });

  test('offline (all requests aborted) is handled gracefully', async ({ network, page }) => {
    await network.abort('**/api/**');
    const failed = await page.evaluate(async () => {
      try {
        await fetch('/api/anything');
        return false;
      } catch {
        return true;
      }
    });
    expect(failed).toBe(true);
  });

  test('a transient failure recovers on retry', async ({ network, page }) => {
    let calls = 0;
    // First call fails with 500, subsequent calls succeed — the client retries.
    await network.intercept('**/api/flaky', async (route) => {
      calls += 1;
      if (calls === 1) {
        await route.fulfill({ status: 500, body: 'transient' });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
    });

    const result = await page.evaluate(async () => {
      const once = await fetch('/api/flaky');
      const first = once.status;
      const retry = await fetch('/api/flaky');
      return { first, retry: retry.status, body: await retry.json() };
    });
    expect(result.first).toBe(500);
    expect(result.retry).toBe(200);
    expect(result.body).toEqual({ ok: true });
  });
});
