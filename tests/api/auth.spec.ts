/**
 * --------------------------------------------------------
 * File: auth.spec.ts
 * Module: API Tests · Authentication
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: Restful-Booker authentication (token issuance).
 * Business Scenario: Valid credentials yield a usable token; invalid credentials
 *                    yield no token. The token endpoint must meet its SLA.
 * Preconditions: Network access to Restful-Booker; configured Booker creds.
 * Test Strategy: Positive token issuance + schema + negative + response-time SLA.
 * Expected Outcome: 200 with a non-empty token for valid creds; no token for bad.
 * Priority: High
 * Tags: @api @regression @authentication
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';
import { config } from '@config/config';

test.describe('Restful-Booker · Auth API @api @regression @authentication', () => {
  // Restful-Booker runs on a free dyno that cold-starts (~10s+ on first hit).
  // Warm it once so latency-sensitive checks measure a hot endpoint, not the
  // demo's cold start (the framework's documented third-party-availability risk).
  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    await ctx
      .post(`${config.api.restfulBooker.baseUrl}/auth`, {
        data: config.api.restfulBooker.credentials,
        timeout: 30_000,
      })
      .catch(() => undefined);
    await ctx.dispose();
  });

  test('@smoke valid credentials issue a token', async ({ authApi }) => {
    const res = await authApi.createBookerToken();
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  test('token endpoint responds within SLA (warm)', async ({ authApi }) => {
    const res = await authApi.createBookerToken();
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(5000);
  });

  test('invalid credentials are not granted a token', async ({ authApi }) => {
    const res = await authApi.createBookerToken({ username: 'wrong', password: 'wrong' });
    // Restful-Booker answers 200 with a `reason` and no token for bad creds.
    expect(res.body.token).toBeFalsy();
  });

  test('configured admin credentials authenticate successfully', async ({ authApi }) => {
    const res = await authApi.createBookerToken(config.api.restfulBooker.credentials);
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.token).toBeTruthy();
  });
});
