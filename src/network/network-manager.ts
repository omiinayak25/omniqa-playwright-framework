/**
 * --------------------------------------------------------
 * File: network-manager.ts
 * Module: Network
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Reusable wrapper over Playwright's request routing — route mocking, request
 * abortion/throttling, response interception/rewriting, traffic capture, and
 * HAR record/replay. Lets specs control the network in one line each.
 *
 * Responsibilities:
 * - Mock/stub responses (mockJson/mock) and block/delay requests (abort/delay).
 * - Intercept + rewrite real responses (modifyResponse).
 * - Capture request/response traffic for analytics + assertions.
 * - Record and replay HAR archives (deterministic offline runs).
 *
 * Used By:
 * net.fixtures.ts (DI as the `network` fixture), tests/network/** specs.
 *
 * Dependencies:
 * Playwright (Page/Route/Request), winston Logger, scopedLogger (@utils/logger),
 * network.types.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Route handlers are last-registered-first-served in Playwright, so a later
 * mock overrides an earlier one for the same pattern. All mocks add permissive
 * CORS headers so same- and cross-origin in-page fetches can read the body.
 * --------------------------------------------------------
 */
import type { Page, Route, Request } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import type { MockResponse, NetworkRecord, UrlPattern } from '@network/network.types';

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  'access-control-allow-headers': '*',
};

/**
 * NetworkManager controls the page's network. TEST-scoped (bound to one page)
 * and self-cleaning — `dispose()` removes all routes and listeners.
 */
export class NetworkManager {
  private readonly page: Page;
  private readonly log: Logger;
  private readonly records: NetworkRecord[] = [];
  private capturing = false;

  constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger('Network');
  }

  /**
   * Purpose: Stub a route with a JSON body.
   * @param pattern - URL glob/RegExp to intercept.
   * @param body - Object serialised to a JSON response.
   * @param status - HTTP status (default 200).
   */
  public async mockJson(pattern: UrlPattern, body: unknown, status = 200): Promise<void> {
    await this.mock(pattern, { body, status, contentType: 'application/json' });
  }

  /**
   * Purpose: Stub a route with a fully-specified response.
   * @param pattern - URL glob/RegExp to intercept.
   * @param response - Status/body/contentType/headers to fulfil with.
   */
  public async mock(pattern: UrlPattern, response: MockResponse): Promise<void> {
    this.log.info(`Mock: ${String(pattern)} → ${response.status ?? 200}`);
    await this.page.route(pattern, async (route) => {
      const isObject = typeof response.body === 'object' && response.body !== null;
      const body = isObject ? JSON.stringify(response.body) : String(response.body ?? '');
      await route.fulfill({
        status: response.status ?? 200,
        contentType: response.contentType ?? (isObject ? 'application/json' : 'text/plain'),
        headers: { ...CORS_HEADERS, ...(response.headers ?? {}) },
        body,
      });
    });
  }

  /**
   * Purpose: Block requests matching a pattern (simulate offline/3rd-party fail).
   * @param pattern - URL glob/RegExp to abort.
   * @param errorCode - Playwright abort reason (default 'failed').
   */
  public async abort(pattern: UrlPattern, errorCode = 'failed'): Promise<void> {
    this.log.info(`Abort: ${String(pattern)}`);
    await this.page.route(pattern, (route) => route.abort(errorCode));
  }

  /**
   * Purpose: Delay matching requests (simulate slow network) then continue.
   * @param pattern - URL glob/RegExp to throttle.
   * @param ms - Delay in milliseconds before the request proceeds.
   */
  public async delay(pattern: UrlPattern, ms: number): Promise<void> {
    this.log.info(`Delay ${ms}ms: ${String(pattern)}`);
    await this.page.route(pattern, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      await route.continue();
    });
  }

  /**
   * Purpose: Fetch the REAL response then rewrite its JSON before delivery.
   * @param pattern - URL glob/RegExp to intercept.
   * @param transform - Maps the parsed JSON body to a new body.
   */
  public async modifyResponse(
    pattern: UrlPattern,
    transform: (body: unknown) => unknown,
  ): Promise<void> {
    this.log.info(`Modify response: ${String(pattern)}`);
    await this.page.route(pattern, async (route) => {
      const response = await route.fetch();
      let parsed: unknown = null;
      try {
        parsed = await response.json();
      } catch {
        /* non-JSON response — leave as null and pass through unchanged below */
      }
      if (parsed === null) {
        await route.fulfill({ response });
        return;
      }
      await route.fulfill({
        response,
        headers: { ...response.headers(), ...CORS_HEADERS },
        body: JSON.stringify(transform(parsed)),
      });
    });
  }

  /**
   * Purpose: Register a custom route handler (full control: inspect + decide).
   * @param pattern - URL glob/RegExp to intercept.
   * @param handler - Receives the route + request; must fulfil/continue/abort.
   */
  public async intercept(
    pattern: UrlPattern,
    handler: (route: Route, request: Request) => Promise<void>,
  ): Promise<void> {
    await this.page.route(pattern, (route, request) => handler(route, request));
  }

  /**
   * Purpose: Start recording all request/response traffic for analytics.
   * @returns void — captured records are read via {@link traffic}.
   */
  public startCapture(): void {
    if (this.capturing) return;
    this.capturing = true;
    this.page.on('requestfinished', this.onRequestFinished);
    this.page.on('requestfailed', this.onRequestFailed);
  }

  /** Purpose: The captured traffic so far (read-only snapshot). */
  public get traffic(): readonly NetworkRecord[] {
    return this.records;
  }

  /**
   * Purpose: Record live traffic into a HAR file (replay later for offline runs).
   * @param harPath - File path to write/update the HAR archive.
   * @param pattern - Which URLs to record (default everything).
   */
  public async recordHar(harPath: string, pattern: UrlPattern = '**/*'): Promise<void> {
    this.log.info(`Recording HAR → ${harPath}`);
    await this.page.routeFromHAR(harPath, { update: true, url: pattern });
  }

  /**
   * Purpose: Serve responses from a previously-recorded HAR (deterministic).
   * @param harPath - File path of the HAR archive to replay.
   * @param pattern - Which URLs to serve from the HAR (default everything).
   */
  public async replayFromHar(harPath: string, pattern: UrlPattern = '**/*'): Promise<void> {
    this.log.info(`Replaying HAR ← ${harPath}`);
    await this.page.routeFromHAR(harPath, { update: false, url: pattern, notFound: 'abort' });
  }

  /** Purpose: Remove all routes + capture listeners registered by this manager. */
  public async dispose(): Promise<void> {
    if (this.capturing) {
      this.page.off('requestfinished', this.onRequestFinished);
      this.page.off('requestfailed', this.onRequestFailed);
      this.capturing = false;
    }
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }

  // ----------------------------------------------------------------- internals

  private readonly onRequestFinished = (request: Request): void => {
    void (async (): Promise<void> => {
      const response = await request.response();
      // `fromServiceWorker` is false for fulfilled mocks; we record raw traffic
      // here and treat mock-attribution as out of scope for capture analytics.
      this.records.push({
        url: request.url(),
        method: request.method(),
        status: response?.status() ?? -1,
        resourceType: request.resourceType(),
        mocked: false,
      });
    })();
  };

  private readonly onRequestFailed = (request: Request): void => {
    this.records.push({
      url: request.url(),
      method: request.method(),
      status: -1,
      resourceType: request.resourceType(),
      mocked: false,
    });
  };
}
