/**
 * --------------------------------------------------------
 * File: base.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Root of the fixture composition chain — the custom `test` that every spec
 * imports instead of `@playwright/test`. This is where Dependency Injection
 * begins (config, data, logging).
 *
 * Responsibilities:
 * - Provide WORKER-scoped fixtures (appConfig, workerLogger) created once per
 *   worker process and shared by all that worker's tests.
 * - Provide TEST-scoped fixtures (log, data) created fresh per test.
 * - Provide the `autoLog` AUTO fixture that wraps every test body with
 *   correlation-id logging, timing, and failure-diagnostic attachments.
 *
 * Used By:
 * page.fixtures.ts (extends this), and ultimately all specs via @fixtures/index.
 *
 * Dependencies:
 * @playwright/test (base test), @config/config, @utils/logger,
 * @utils/log-context, @utils/log-capture, @utils/random.util, @utils/date.util,
 * @fixtures/fixture.types.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Each later layer EXTENDS this (pages → api → db) via further `.extend()`
 * calls, keeping each layer's wiring in its own file (Open/Closed Principle).
 * --------------------------------------------------------
 *
 * FIXTURE FLOW (this file is the chain root):
 *   base.fixtures (here) → page.fixtures → api.fixtures → db.fixtures
 * Worker-scoped fixtures live for the whole worker process; test-scoped
 * fixtures are rebuilt for each test, guaranteeing isolation.
 *
 *   import { test, expect } from '@fixtures/base.fixtures';
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { config } from '@config/config';
import { scopedLogger, logger } from '@utils/logger';
import { runWithLogContext } from '@utils/log-context';
import { beginCapture, endCapture } from '@utils/log-capture';
import {
  randomFirstName,
  randomLastName,
  randomFullName,
  randomEmail,
  randomUsername,
  randomPassword,
  randomPhone,
  randomInt,
  randomUuid,
} from '@utils/random.util';
import { formatDuration } from '@utils/date.util';
import type { TestFixtures, WorkerFixtures, TestDataApi } from '@fixtures/fixture.types';

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ----------------------------------------------------- WORKER-SCOPED fixtures
  // WHY worker scope: config is immutable and expensive-to-build once; sharing
  // one instance per worker avoids re-resolving it for every test.
  appConfig: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(config);
    },
    { scope: 'worker' },
  ],

  workerLogger: [
    async ({}, use, workerInfo) => {
      const wl = logger.child({ worker: workerInfo.workerIndex });
      await use(wl);
    },
    { scope: 'worker' },
  ],

  // ------------------------------------------------------- TEST-SCOPED fixtures
  log: async ({}, use) => {
    const info = test.info();
    await use(scopedLogger(info.title));
  },

  data: async ({}, use) => {
    const api: TestDataApi = {
      firstName: randomFirstName,
      lastName: randomLastName,
      fullName: randomFullName,
      email: randomEmail,
      username: randomUsername,
      password: randomPassword,
      phone: randomPhone,
      int: randomInt,
      uuid: randomUuid,
    };
    await use(api);
  },

  // --------------------------------------------------------- AUTO fixture (DI)
  // `auto: true` => runs for every test without being requested.
  autoLog: [
    async ({ log }, use) => {
      const info = test.info();
      const startedAt = Date.now();
      // Short correlation id ties every log line of this test together.
      const correlationId = randomUuid().slice(0, 8);
      beginCapture(correlationId);

      // Run the WHOLE test body inside the async log context so all API/DB/
      // browser logs are tagged with this correlation id and captured.
      await runWithLogContext({ correlationId, testName: info.title }, async () => {
        log.info(`▶ START: ${info.titlePath.join(' › ')}`);
        await use(); // ---- the test body runs here ----
      });

      const duration = formatDuration(Date.now() - startedAt);
      const status = info.status ?? 'unknown';
      const expected = info.expectedStatus;
      const captured = endCapture(correlationId);

      if (status === expected) {
        log.info(`✔ PASS (${duration}) [${correlationId}]: ${info.title}`);
      } else {
        log.error(`✘ ${status.toUpperCase()} (${duration}) [${correlationId}]: ${info.title}`);
        // Attach the full execution log + a per-test failure log file.
        const body = captured.join('\n');
        await info.attach('execution-log', { body, contentType: 'text/plain' });
        if (info.errors.length > 0) {
          await info.attach('failure-summary', {
            body: info.errors.map((e) => e.message ?? String(e)).join('\n\n'),
            contentType: 'text/plain',
          });
        }
        try {
          const dir = path.resolve(process.cwd(), 'logs', 'failures');
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, `${correlationId}.log`), body, 'utf-8');
        } catch {
          /* best-effort: never let log persistence fail a test */
        }
      }
    },
    { auto: true },
  ],
});

export { expect };
