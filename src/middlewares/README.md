# Middlewares — OMNIQA Playwright Framework

- **Purpose** — A composable, chainable **middleware pipeline** (the "onion" model) for the API transport layer. Each middleware wraps the next, so cross-cutting concerns compose around a single HTTP dispatch — **without duplicating** what `ApiClient` already owns (retry, masked logging, `responseTimeMs`).

## Why this folder exists

Cross-cutting API concerns (trace propagation, SLA timing, call capture) shouldn't be copy-pasted into every service or baked rigidly into `ApiClient`. A pipeline lets you compose exactly the concerns a run needs, in order, opt-in.

## When to use it

- You need a **request-scoped cross-cutting concern** that should apply uniformly (e.g. propagate a correlation id, capture calls).
- **Do NOT** re-implement what `ApiClient` already does — there is intentionally **no** `RequestLoggingMiddleware`/`ResponseLoggingMiddleware` (ApiClient logs, masked), **no** `RetryMiddleware` (ApiClient retries with backoff), **no** `AuthorizationMiddleware` (ApiClient sets Bearer from `options.token`), and **no** `ErrorHandlingMiddleware` (ApiClient throws a descriptive error).

## Files

| File                              | Responsibility                                                              |
| --------------------------------- | -------------------------------------------------------------------------- |
| `middleware.ts`                   | Pipeline core: `ApiMiddleware`, contexts, `MiddlewarePipeline` (onion).      |
| `correlation-id.middleware.ts`    | `CorrelationIdMiddleware` — emit `x-correlation-id` (reuses log context).    |
| `timing.middleware.ts`            | `TimingMiddleware` — warn when a call exceeds an SLA threshold.              |
| `network-capture.middleware.ts`   | `NetworkCaptureMiddleware` — record an inspectable list of exchanges.        |
| `index.ts`                        | Barrel export (`@middlewares`).                                             |

## How it integrates

- **`ApiClient`** gained an optional `middlewares` constructor arg; it runs the pipeline around **one dispatch attempt** inside its existing retry loop. **Empty pipeline = no behaviour change** (no-op), so all existing tests are unaffected.
- **Logger** — `CorrelationIdMiddleware` reuses `currentCorrelationId()` so client logs, the request header, and server logs share one trace id.
- **Real caller** — `step-definitions/support/api.support.ts` builds every BDD API client with `[CorrelationIdMiddleware, TimingMiddleware]`.

## Design / enterprise principles

- **Composition over inheritance / Chain of Responsibility** — `reduceRight` builds the onion; order = registration order.
- **Open/Closed** — add concerns without touching `ApiClient`.
- **No duplication** — retry/logging/timing stay in `ApiClient`; middlewares only add what's new.
- **Strict TypeScript** — typed contexts, `readonly` records, no `any`.

## Usage Example

```ts
import { ApiClient } from '@api/clients/api-client';
import { CorrelationIdMiddleware, NetworkCaptureMiddleware } from '@middlewares';

const capture = new NetworkCaptureMiddleware();
const client = new ApiClient(ctx, baseUrl, {}, [new CorrelationIdMiddleware(), capture]);
await client.get('/products/1');
console.log(capture.records()); // [{ method:'GET', url:'…/products/1', status:200, responseTimeMs:… }]
```
