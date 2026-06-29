/**
 * --------------------------------------------------------
 * File: correlation-id.middleware.ts
 * Module: Middlewares
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Propagate a correlation id onto every outgoing request as an
 * `x-correlation-id` header, reusing the Logger's active correlation context so
 * client logs, the request header, and server logs all share one trace id.
 * (ApiClient logs ids internally but did not EMIT them — this adds that.)
 *
 * Dependencies:
 * node:crypto (randomUUID fallback), @constants/http.constants (HEADERS),
 * @utils/log-context (currentCorrelationId), @middlewares/middleware.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { randomUUID } from 'node:crypto';
import { HEADERS } from '@constants/http.constants';
import { currentCorrelationId } from '@utils/log-context';
import type {
  ApiMiddleware,
  DispatchFn,
  HttpRequestContext,
  HttpResponseContext,
} from '@middlewares/middleware';

/** Adds an `x-correlation-id` header (active log context id, or a fresh UUID). */
export class CorrelationIdMiddleware implements ApiMiddleware {
  public readonly name = 'correlation-id';

  public handle(request: HttpRequestContext, next: DispatchFn): Promise<HttpResponseContext> {
    request.headers[HEADERS.CORRELATION_ID] = currentCorrelationId() ?? randomUUID();
    return next(request);
  }
}
