# Fixtures (Dependency Injection) — OMNIQA Playwright Framework

- **Purpose** — Custom Playwright `test`/`expect` built by a composition chain that injects config, data, logging, page objects, API services, and DB helpers. Every spec imports from `@fixtures/index`.

## Files

| File                 | Responsibility                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`           | Stable public import surface — re-exports the composed `test`/`expect` and fixture type contracts.                                                       |
| `base.fixtures.ts`   | Chain root: worker-scoped config/logger, test-scoped `log`/`data`, and the auto `autoLog` fixture (correlation-id logging, timing, failure attachments). |
| `page.fixtures.ts`   | Extends base — injects ready-to-use Page Objects (SauceDemo, OrangeHRM).                                                                                 |
| `api.fixtures.ts`    | Extends page — injects API service classes (Auth/Booking/User/Product/Post/Pet).                                                                         |
| `db.fixtures.ts`     | Extends api — injects `QueryRunner`, `DbAssertions`, and repositories.                                                                                   |
| `a11y.fixtures.ts`   | Extends db — injects the axe `a11yScanner`, `keyboard` navigator, `a11yReporter`, and the high-level `a11y` assertions.                                  |
| `visual.fixtures.ts` | Extends a11y — injects the `visual` screenshot comparator (visual regression).                                                                           |
| `perf.fixtures.ts`   | Extends visual — injects `perf` (collector), `perfAssert` (budget), `perfReporter`, and the optional `lighthouse` runner.                                |
| `net.fixtures.ts`    | Chain tail — injects the `network` manager (route mock / intercept / HAR), auto-disposed after each test.                                                |
| `fixture.types.ts`   | Type contracts for the fixtures, split by scope (TestFixtures/WorkerFixtures/TestDataApi).                                                               |

## Responsibilities

- Build the custom `test` via the chain `base → page → api → db → a11y → visual → perf → net`, each layer `.extend()`-ing the previous (Open/Closed).
- Provide DI of config, fake-data generators, scoped loggers, page objects, services, and DB helpers.
- Keep a stable import line for specs so the chain can grow without touching call sites.

## Dependencies

- `@playwright/test`, `@config/config`, `@utils/*` (logger, log-context, log-capture, random, date)
- `@pages/*`, `@services/*`, `@api/*`, `@database/*`, `@repositories/*`

## Interacts With

- Imported by every spec under `tests/`; wires together pages, services, and DB layers.

## Usage Example

```ts
import { test, expect } from '@fixtures/index';

test('lists bookings', async ({ bookingApi }) => {
  const res = await bookingApi.getAllIds();
  expect(res.status).toBe(200);
});
```
