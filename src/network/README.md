# Network — OMINQA Playwright Framework

- **Purpose** — Reusable, DI-friendly control over the page's network: route mocking, request abortion/throttling, response interception/rewriting, traffic capture, and HAR record/replay. Lets specs shape backend behaviour deterministically without a live backend.

## Files

| File                 | Responsibility                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `network.types.ts`   | `MockResponse`, `NetworkRecord`, `UrlPattern` contracts.                                                                                   |
| `network-manager.ts` | `NetworkManager` — `mock/mockJson`, `abort`, `delay`, `intercept`, `modifyResponse`, `startCapture`, `recordHar/replayFromHar`, `dispose`. |
| `index.ts`           | Barrel.                                                                                                                                    |

## Capabilities

- **Route mocking** — `mockJson(url, body)` / `mock(url, { status, body, contentType, headers })` (CORS headers auto-added).
- **Network interception** — `intercept(url, (route, req) => …)`, `modifyResponse(url, body => newBody)` (fetch real → rewrite).
- **Failure / latency simulation** — `abort(url)`, `delay(url, ms)`.
- **Traffic capture** — `startCapture()` then read `network.traffic` (`NetworkRecord[]`).
- **HAR** — `recordHar(path)` (record live), `replayFromHar(path, pattern)` (deterministic offline replay).

Injected as the `network` fixture (chain tail `…→ perf → net`); auto-`dispose()`d after each test.

## Usage Example

```ts
import { test, expect } from '@fixtures/index';

test('handles a 500 from the profile API', async ({ network, page }) => {
  await network.mock('**/api/profile', { status: 500, body: { error: 'boom' } });
  await page.goto('/dashboard');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});

test('runs offline from a recorded archive', async ({ network, page }) => {
  await network.replayFromHar('tests/network/fixtures/session.har', '**/api/**');
  // …assert against deterministic, recorded responses
});
```

## Run

```bash
npm run test:network
```
