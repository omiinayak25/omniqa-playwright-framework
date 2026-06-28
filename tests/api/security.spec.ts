/**
 * --------------------------------------------------------
 * File: security.spec.ts
 * Module: API Tests · Security
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: API security properties — headers, injection inertness,
 *                     and sanitised error bodies.
 * Business Scenario: The API must label content types, treat injection payloads
 *                    as inert data, and never leak internals in error responses.
 * Preconditions: Network access to DummyJSON.
 * Test Strategy: OWASP-style probes reusing the shared EdgeInputFactory.
 * Expected Outcome: Correct content-type; payloads stored as literal data;
 *                   error bodies contain no stack traces.
 * Priority: High
 * Tags: @api @regression @security
 *
 * Last Updated: 2026-06-28
 * Notes: Consolidates API-tier security checks; UI-tier injection is covered by
 * login.security / checkout.security; DB injection by advanced.spec.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { HttpStatus } from '@constants/index';
import { EdgeInputFactory } from '@factories/index';

const looksLikeStackTrace = (s: string): boolean =>
  /\bat\s+.*:\d+:\d+/.test(s) || /\.js:\d+/.test(s) || s.includes('Error:');

test.describe('DummyJSON · API security @api @regression @security', () => {
  test('@smoke a successful response declares a JSON content-type', async ({ productApi }) => {
    const res = await productApi.list(1, 0);
    expect(res.status).toBe(HttpStatus.OK);
    const contentType = res.headers['content-type'] ?? '';
    expect(contentType).toContain('application/json');
  });

  test('an XSS payload is stored and echoed as inert JSON data', async ({ productApi }) => {
    const payload = EdgeInputFactory.xss()[0]!.value;
    const res = await productApi.add({ title: payload });
    // Echoed back verbatim as a JSON string value — never as executable HTML.
    expect(res.body.title).toBe(payload);
    expect(res.headers['content-type'] ?? '').toContain('application/json');
  });

  test('a SQLi payload in a product title is treated as literal data', async ({ productApi }) => {
    const payload = EdgeInputFactory.sqlInjection()[0]!.value;
    const res = await productApi.add({ title: payload });
    expect(res.body.title).toBe(payload);
    expect(res.body.id).toBeTruthy(); // request succeeded, no injection side-effect
  });

  test('an unknown-resource 404 body contains no stack trace', async ({ productApi }) => {
    const res = await productApi.getById(999_999);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(looksLikeStackTrace(JSON.stringify(res.body))).toBe(false);
  });
});
