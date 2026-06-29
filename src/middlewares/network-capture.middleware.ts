/**
 * --------------------------------------------------------
 * File: network-capture.middleware.ts
 * Module: Middlewares
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Record a lightweight summary of every request/response that flows through the
 * pipeline, so tests/reporters can inspect what calls a scenario made (NEW —
 * ApiClient logs but keeps no inspectable record).
 *
 * Dependencies:
 * @middlewares/middleware.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import type {
  ApiMiddleware,
  DispatchFn,
  HttpRequestContext,
  HttpResponseContext,
} from '@middlewares/middleware';

/** One captured request/response summary. */
export interface ApiExchangeRecord {
  readonly method: string;
  readonly url: string;
  readonly status: number;
  readonly responseTimeMs: number;
}

/** Captures an inspectable list of exchanges for reporting/inspection. */
export class NetworkCaptureMiddleware implements ApiMiddleware {
  public readonly name = 'network-capture';
  private readonly captured: ApiExchangeRecord[] = [];

  public async handle(request: HttpRequestContext, next: DispatchFn): Promise<HttpResponseContext> {
    const response = await next(request);
    this.captured.push({
      method: request.method,
      url: request.url,
      status: response.status,
      responseTimeMs: response.responseTimeMs,
    });
    return response;
  }

  /** Immutable snapshot of captured exchanges. */
  public records(): readonly ApiExchangeRecord[] {
    return [...this.captured];
  }

  /** Drop all captured records. */
  public clear(): void {
    this.captured.length = 0;
  }
}
