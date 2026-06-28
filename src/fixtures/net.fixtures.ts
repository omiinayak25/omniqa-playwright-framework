/**
 * --------------------------------------------------------
 * File: net.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Network link in the fixture chain — injects a NetworkManager bound to the
 * test's page, and auto-disposes its routes/listeners after the test.
 *
 * Responsibilities:
 * - Extend perf.fixtures (previous chain tail) with the `network` fixture.
 * - Tear down all routes/captures when the test ends (no cross-test leakage).
 *
 * Used By:
 * @fixtures/index (re-exports this composed `test`), tests/network/**.
 *
 * Dependencies:
 * @fixtures/perf.fixtures (chain parent), @network/index.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Open/Closed: ADD a layer, never modify existing fixtures. New chain tail.
 *
 * FIXTURE FLOW:
 *   base → page → api → db → a11y → visual → perf → net (here)
 * --------------------------------------------------------
 */
import { test as base } from '@fixtures/perf.fixtures';
import { NetworkManager } from '@network/index';

export interface NetworkFixtures {
  /** Route-mocking / interception / HAR controller bound to the test's page. */
  readonly network: NetworkManager;
}

export const test = base.extend<NetworkFixtures>({
  network: async ({ page }, use) => {
    const manager = new NetworkManager(page);
    await use(manager);
    // Auto-cleanup so routes/listeners never leak into the next test.
    await manager.dispose();
  },
});

export { expect } from '@fixtures/base.fixtures';
