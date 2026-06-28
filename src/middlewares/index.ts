/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Middlewares
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel export for the Middleware layer (`@middlewares`) — the pipeline core
 * plus the concrete, non-duplicative middlewares.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export {
  MiddlewarePipeline,
  type ApiMiddleware,
  type DispatchFn,
  type HttpRequestContext,
  type HttpResponseContext,
} from '@middlewares/middleware';
export { CorrelationIdMiddleware } from '@middlewares/correlation-id.middleware';
export { TimingMiddleware } from '@middlewares/timing.middleware';
export { NetworkCaptureMiddleware, type ApiExchangeRecord } from '@middlewares/network-capture.middleware';
