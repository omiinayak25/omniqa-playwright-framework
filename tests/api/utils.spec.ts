/**
 * --------------------------------------------------------
 * File: utils.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Shared utility layer (crypto, random, async, file I/O).
 * Business Scenario: Helper utilities must behave correctly across the framework.
 * Preconditions: Writable test-results temp dir; no UI/network required.
 * Test Strategy: Unit-style self-tests with round-trip and boundary checks.
 * Expected Outcome: Each utility round-trips/returns within its contract.
 * Priority: Medium
 * Tags: @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Utilities self-test. Validates the Phase 4 utility layer end-to-end
 * (no UI/network). Tagged @smoke.
 */
import * as path from 'node:path';
import { test, expect } from '@fixtures/index';
import {
  encrypt,
  decrypt,
  sha256,
  maskSecret,
  randomEmail,
  randomInt,
  retryAsync,
  pollUntil,
  formatDuration,
  fileTimestamp,
  writeJson,
  readJson,
  writeCsv,
  readCsv,
  writeExcel,
  readExcel,
  deleteFile,
} from '@utils/index';

const TMP = path.resolve(process.cwd(), 'test-results', 'util-tmp');

test.describe('Crypto utils @smoke', () => {
  test('encrypt → decrypt round-trips', () => {
    const secret = 'P@ssw0rd-123';
    const cipher = encrypt(secret);
    expect(cipher).not.toBe(secret);
    expect(decrypt(cipher)).toBe(secret);
  });

  test('sha256 is deterministic; maskSecret hides middle', () => {
    expect(sha256('abc')).toBe(sha256('abc'));
    expect(maskSecret('secret_sauce')).toBe('se********ce');
  });
});

test.describe('Random utils @smoke', () => {
  test('email looks like an email; int respects bounds', () => {
    expect(randomEmail()).toMatch(/@/);
    const n = randomInt(5, 10);
    expect(n).toBeGreaterThanOrEqual(5);
    expect(n).toBeLessThanOrEqual(10);
  });
});

test.describe('Async utils @smoke', () => {
  test('retryAsync eventually succeeds', async () => {
    let attempts = 0;
    const result = await retryAsync(
      async () => {
        attempts += 1;
        if (attempts < 3) throw new Error('transient');
        return 'ok';
      },
      { retries: 5, delayMs: 1, label: 'flaky-op' },
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  test('pollUntil resolves when predicate becomes true', async () => {
    const start = Date.now();
    await pollUntil(() => Date.now() - start > 20, { timeoutMs: 1000, intervalMs: 5 });
    expect(Date.now() - start).toBeGreaterThan(20);
  });

  test('formatDuration & fileTimestamp produce sane strings', () => {
    expect(formatDuration(1500)).toBe('1.50s');
    expect(fileTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/);
  });
});

test.describe('File utils (JSON/CSV/Excel) @smoke', () => {
  test('JSON write/read round-trips', () => {
    const file = path.join(TMP, 'data.json');
    writeJson(file, { id: 1, name: 'Neo' });
    expect(readJson<{ id: number; name: string }>(file)).toEqual({ id: 1, name: 'Neo' });
    deleteFile(file);
  });

  test('CSV write/read round-trips', () => {
    const file = path.join(TMP, 'data.csv');
    writeCsv(file, [{ id: '1', city: 'Pune, MH' }]);
    const rows = readCsv(file);
    expect(rows[0]).toEqual({ id: '1', city: 'Pune, MH' });
    deleteFile(file);
  });

  test('Excel write/read round-trips', async () => {
    const file = path.join(TMP, 'data.xlsx');
    await writeExcel(file, [{ id: 1, role: 'QA' }]);
    const rows = await readExcel(file);
    expect(rows[0]?.['role']).toBe('QA');
    deleteFile(file);
  });
});
