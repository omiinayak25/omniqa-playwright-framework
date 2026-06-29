/**
 * --------------------------------------------------------
 * File: timing.middleware.ts
 * Module: Middlewares
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Pipeline-level SLA guard: measures wall time around the wrapped dispatch and
 * warns when it exceeds a configurable threshold. Complements ApiClient's
 * per-response `responseTimeMs` (which it does NOT duplicate — this adds a
 * threshold WARNING at the chain layer).
 *
 * Dependencies:
 * @utils/logger (scopedLogger), @middlewares/middleware.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { scopedLogger } from '@utils/logger';
import type {
  ApiMiddleware,
  DispatchFn,
  HttpRequestContext,
  HttpResponseContext,
} from '@middlewares/middleware';

/** Warns when a request exceeds `slowThresholdMs`. */
export class TimingMiddleware implements ApiMiddleware {
  public readonly name = 'timing';
  private readonly log = scopedLogger('Timing');

  constructor(private readonly slowThresholdMs = 2_000) {}

  public async handle(request: HttpRequestContext, next: DispatchFn): Promise<HttpResponseContext> {
    const started = Date.now();
    const response = await next(request);
    const elapsed = Date.now() - started;
    if (elapsed > this.slowThresholdMs) {
      this.log.warn(
        `SLOW ${request.method} ${request.url} took ${elapsed}ms (> ${this.slowThresholdMs}ms)`,
      );
    }
    return response;
  }
}
