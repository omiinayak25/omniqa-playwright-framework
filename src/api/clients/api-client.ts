/**
 * --------------------------------------------------------
 * File: api-client.ts
 * Module: API Client
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Thin, reusable transport wrapper over Playwright's APIRequestContext.
 * Centralizes URL/header building, request dispatch, response normalization,
 * masked logging, and transient-failure retry for all API service classes.
 *
 * Responsibilities:
 * - Build absolute URLs (baseUrl + path + query params)
 * - Assemble headers (defaults + JSON Accept/Content-Type + optional Bearer auth)
 * - Dispatch every HTTP verb (GET/POST/PUT/PATCH/DELETE)
 * - Normalize raw responses into a typed ApiResponse<T> (status, body, timing)
 * - Emit structured request/response logs with secrets masked
 * - Retry transient failures (network errors + 5xx) with exponential backoff
 *
 * Used By:
 * src/services/*.api.ts (service classes), api.fixtures.ts, tests/api/*
 *
 * Dependencies:
 * APIRequestContext/APIResponse (@playwright/test), scopedLogger, sleep,
 * maskSecret, HttpMethod/HEADERS/CONTENT_TYPES constants, ApiResponse/RequestOptions models
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Pure transport layer — performs no assertions (see ResponseValidator) and
 * has no knowledge of business resources (see service classes). One client per base URL.
 * --------------------------------------------------------
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { scopedLogger } from '@utils/logger';
import { sleep } from '@utils/wait.util';
import { maskSecret } from '@utils/crypto.util';
import { HttpMethod, HEADERS, CONTENT_TYPES } from '@constants/http.constants';
import type { ApiResponse, RequestOptions } from '@models/api.model';
import { MiddlewarePipeline, type ApiMiddleware, type HttpRequestContext } from '@middlewares/index';

/**
 * ApiClient
 *
 * Transport-layer HTTP client. Exists to give every service class a single,
 * consistent way to talk to a REST API without duplicating URL building, header
 * assembly, retry, or logging logic. Strictly SRP: it moves bytes over the wire
 * and shapes them into ApiResponse<T> — it never asserts and never models domain
 * resources. Instantiate one per base URL.
 */
export class ApiClient {
  private readonly context: APIRequestContext;
  private readonly baseUrl: string;
  private readonly defaultHeaders: Readonly<Record<string, string>>;
  private readonly pipeline: MiddlewarePipeline;
  private readonly log = scopedLogger('ApiClient');

  /**
   * Create a client bound to a single base URL.
   *
   * @param context Playwright request context that performs the actual I/O.
   * @param baseUrl Base URL for relative paths; any trailing slash is trimmed
   *                so path concatenation stays predictable.
   * @param defaultHeaders Headers applied to every request (e.g. a static
   *                       `x-api-key`); per-request headers can override them.
   * @param middlewares Optional cross-cutting middleware chain run around each
   *                    dispatch attempt (correlation id, timing, capture). Empty
   *                    by default — a no-op that preserves existing behaviour.
   */
  constructor(
    context: APIRequestContext,
    baseUrl: string,
    defaultHeaders: Record<string, string> = {},
    middlewares: readonly ApiMiddleware[] = [],
  ) {
    this.context = context;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = defaultHeaders;
    this.pipeline = new MiddlewarePipeline(middlewares);
  }

  /**
   * Issue a GET request.
   * @param path Relative path (or absolute URL) to request.
   * @param options Optional query params, headers, token, and retry count.
   * @returns Normalized, typed ApiResponse<T>.
   */
  public get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.GET, path, options);
  }

  /**
   * Issue a POST request.
   * @param path Relative path (or absolute URL) to request.
   * @param options Request options; `options.data` is sent as the JSON body.
   * @returns Normalized, typed ApiResponse<T>.
   */
  public post<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.POST, path, options);
  }

  /**
   * Issue a PUT request (full replace).
   * @param path Relative path (or absolute URL) to request.
   * @param options Request options; `options.data` is sent as the JSON body.
   * @returns Normalized, typed ApiResponse<T>.
   */
  public put<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PUT, path, options);
  }

  /**
   * Issue a PATCH request (partial update).
   * @param path Relative path (or absolute URL) to request.
   * @param options Request options; `options.data` is sent as the JSON body.
   * @returns Normalized, typed ApiResponse<T>.
   */
  public patch<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.PATCH, path, options);
  }

  /**
   * Issue a DELETE request.
   * @param path Relative path (or absolute URL) to request.
   * @param options Optional headers/token (e.g. auth cookie) and retry count.
   * @returns Normalized, typed ApiResponse<T>.
   */
  public delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(HttpMethod.DELETE, path, options);
  }

  // --------------------------------------------------------------- internals

  /**
   * Resolve the final request URL from a path and optional query params.
   * @param path Relative path, or an absolute URL (used verbatim).
   * @param params Key/value query params; serialized via URLSearchParams.
   * @returns Fully-qualified URL with an encoded query string when params exist.
   */
  private buildUrl(path: string, params?: RequestOptions['params']): string {
    // Absolute URLs bypass baseUrl so callers can hit cross-host endpoints.
    const base = /^https?:\/\//.test(path) ? path : `${this.baseUrl}${path}`;
    if (params === undefined || Object.keys(params).length === 0) return base;
    // URLSearchParams handles encoding; values are coerced to strings.
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) qs.append(key, String(value));
    return `${base}?${qs.toString()}`;
  }

  /**
   * Merge JSON defaults, client default headers, and per-request overrides.
   * Precedence (lowest → highest): Accept/Content-Type → defaultHeaders →
   * per-request headers → Bearer token.
   * @param options Per-request options carrying headers, contentType, token.
   * @returns The fully-merged header map for this request.
   */
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      [HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
      [HEADERS.CONTENT_TYPE]: options?.contentType ?? CONTENT_TYPES.JSON,
      ...this.defaultHeaders,
      ...(options?.headers ?? {}),
    };
    if (options?.token !== undefined) {
      // Bearer scheme; cookie-based auth (e.g. Restful-Booker) is passed by
      // services as an explicit Cookie header instead.
      headers[HEADERS.AUTHORIZATION] = `Bearer ${options.token}`;
    }
    return headers;
  }

  /**
   * Produce a log-safe copy of headers with credential values masked.
   * @param headers Outgoing headers about to be logged.
   * @returns A clone where authorization/api-key/cookie values are masked.
   */
  private safeHeaders(headers: Record<string, string>): Record<string, string> {
    const clone: Record<string, string> = { ...headers };
    for (const key of Object.keys(clone)) {
      // Mask any header that can carry a secret so logs never leak credentials.
      if (/authorization|api-key|cookie/i.test(key)) clone[key] = maskSecret(clone[key] ?? '');
    }
    return clone;
  }

  /**
   * Parse the response body into T, choosing JSON vs text by content type.
   * @param response Raw Playwright APIResponse.
   * @returns Parsed body: JSON object when content-type is JSON, else raw text.
   */
  private async parseBody<T>(response: APIResponse): Promise<T> {
    const contentType = response.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch {
        // Fall back to text if the server lies about content-type or sends empty body.
        return (await response.text()) as unknown as T;
      }
    }
    return (await response.text()) as unknown as T;
  }

  /**
   * Route a verb to the matching Playwright context method.
   * @param method HTTP verb to perform.
   * @param url Fully-resolved request URL.
   * @param headers Merged request headers.
   * @param data Optional request body (omitted from the payload when undefined).
   * @returns The raw Playwright APIResponse promise.
   * @throws Error when an unsupported HTTP method is supplied.
   */
  private dispatch(
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    data: unknown,
  ): Promise<APIResponse> {
    const payload = { headers, ...(data !== undefined ? { data } : {}) };
    switch (method) {
      case HttpMethod.GET:
        return this.context.get(url, { headers });
      case HttpMethod.POST:
        return this.context.post(url, payload);
      case HttpMethod.PUT:
        return this.context.put(url, payload);
      case HttpMethod.PATCH:
        return this.context.patch(url, payload);
      case HttpMethod.DELETE:
        return this.context.delete(url, payload);
      default:
        throw new Error(`[ApiClient] Unsupported method: ${String(method)}`);
    }
  }

  /**
   * Core request pipeline shared by every verb: build URL/headers, dispatch,
   * retry transient failures with exponential backoff, then normalize the
   * result into an ApiResponse<T>.
   *
   * Retry policy: retries network errors and 5xx responses up to
   * `options.retries` times (default 2 → 3 total attempts). Backoff starts at
   * 400ms and doubles each attempt. 4xx responses are returned, not retried.
   *
   * @param method HTTP verb to perform.
   * @param path Relative path or absolute URL.
   * @param options Query params, headers, token, body data, and retry count.
   * @returns Normalized ApiResponse<T> (status, ok, headers, body, timing, raw).
   * @throws Error when all attempts fail (last network error message included).
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options?.params);
    const headers = this.buildHeaders(options);
    // +1 because `retries` counts retries, not the initial attempt.
    const maxAttempts = (options?.retries ?? 2) + 1;
    let backoff = 400;

    this.log.info(`→ ${method} ${url}`, { headers: this.safeHeaders(headers) });

    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const start = Date.now();
      try {
        // Run the middleware chain around ONE dispatch attempt. With no
        // middlewares the pipeline calls `core` directly (zero behaviour change).
        const requestContext: HttpRequestContext = {
          method,
          url,
          headers: { ...headers },
          ...(options?.data !== undefined ? { data: options.data } : {}),
        };
        const exchange = await this.pipeline.execute(requestContext, async (req) => {
          const raw = await this.dispatch(req.method as HttpMethod, req.url, req.headers, req.data);
          return {
            status: raw.status(),
            ok: raw.ok(),
            headers: raw.headers(),
            responseTimeMs: Date.now() - start,
            raw,
          };
        });
        const status = exchange.status;

        // Retry transient server errors (idempotent at this layer).
        if (status >= 500 && attempt < maxAttempts) {
          this.log.warn(
            `← ${status} ${method} ${url} (attempt ${attempt}/${maxAttempts}) — retrying`,
          );
          await sleep(backoff);
          backoff *= 2;
          continue;
        }

        const body = await this.parseBody<T>(exchange.raw);
        this.log.info(`← ${status} ${method} ${url} (${exchange.responseTimeMs}ms)`);
        return {
          status,
          ok: exchange.ok,
          headers: exchange.headers,
          body,
          responseTimeMs: exchange.responseTimeMs,
          raw: exchange.raw,
        };
      } catch (error: unknown) {
        lastError = error;
        const reason = error instanceof Error ? error.message : String(error);
        if (attempt >= maxAttempts) break;
        this.log.warn(
          `✗ ${method} ${url} network error (attempt ${attempt}/${maxAttempts}): ${reason} — retrying`,
        );
        await sleep(backoff);
        backoff *= 2;
      }
    }

    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(
      `[ApiClient] ${method} ${url} failed after ${maxAttempts} attempt(s): ${reason}`,
    );
  }
}
