/**
 * --------------------------------------------------------
 * File: middleware.ts
 * Module: Middlewares
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Composable, chainable middleware pipeline for the API transport layer (the
 * "onion" model). Each middleware wraps the next, so cross-cutting concerns
 * (correlation id, timing, capture) compose around a single HTTP dispatch
 * WITHOUT duplicating what ApiClient already owns (retry, masked logging).
 *
 * Responsibilities:
 * - Define the request/response context exchanged through the chain.
 * - Define the ApiMiddleware contract and the pipeline that composes them.
 *
 * Used By:
 * @api/clients/api-client (runs the pipeline per attempt), @middlewares/*.
 *
 * Dependencies:
 * @playwright/test (APIResponse type only).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * The pipeline wraps ONE dispatch attempt; retry/backoff stays in ApiClient, so
 * retry is never duplicated. An empty pipeline is a no-op (calls core directly).
 * --------------------------------------------------------
 */
import type { APIResponse } from '@playwright/test';

/** Mutable outgoing request seen by middlewares (they may add headers, etc.). */
export interface HttpRequestContext {
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly data?: unknown;
}

/** Response metadata produced by a dispatch (body is parsed later by ApiClient). */
export interface HttpResponseContext {
  readonly status: number;
  readonly ok: boolean;
  readonly headers: Record<string, string>;
  readonly responseTimeMs: number;
  readonly raw: APIResponse;
}

/** Performs the wrapped work (the next middleware, or the core dispatch). */
export type DispatchFn = (request: HttpRequestContext) => Promise<HttpResponseContext>;

/** A composable cross-cutting concern around an HTTP dispatch. */
export interface ApiMiddleware {
  readonly name: string;
  handle(request: HttpRequestContext, next: DispatchFn): Promise<HttpResponseContext>;
}

/** Composes middlewares into a single onion chain around a core dispatch. */
export class MiddlewarePipeline {
  private readonly middlewares: readonly ApiMiddleware[];

  constructor(middlewares: readonly ApiMiddleware[] = []) {
    this.middlewares = middlewares;
  }

  /** Run `core` wrapped by every middleware (outermost = first registered). */
  public execute(request: HttpRequestContext, core: DispatchFn): Promise<HttpResponseContext> {
    const chain = this.middlewares.reduceRight<DispatchFn>(
      (next, middleware) => (req) => middleware.handle(req, next),
      core,
    );
    return chain(request);
  }
}
