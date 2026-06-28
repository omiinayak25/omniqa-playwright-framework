/**
 * --------------------------------------------------------
 * File: summary-reporter.ts
 * Module: Custom Reporters
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * A custom Playwright reporter that emits a concise end-of-run summary to the
 * console plus a machine-readable reports/summary.json for CI consumers.
 *
 * Responsibilities:
 * - Record each finished test (title, project, status, duration).
 * - On run end, compute totals, pass rate, slowest tests, and failures grouped
 *   by project.
 * - Write reports/summary.json and print a human-readable summary block.
 *
 * Used By:
 * playwright.config.ts (registered in the `reporter` array).
 *
 * Dependencies:
 * node:fs, node:path, @playwright/test/reporter (Reporter interface + types).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Implements Playwright's Reporter interface. CAVEAT: passing --reporter on the
 * CLI OVERRIDES the config `reporter` array, so this reporter (and its
 * summary.json) will not run unless it is included in that CLI override too.
 * --------------------------------------------------------
 *
 * REPORTER FLOW:
 *   onBegin   → capture run start time
 *   onTestEnd → push one TestRecord per finished test (accumulates state)
 *   onEnd     → aggregate records → write reports/summary.json + console block
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

interface TestRecord {
  readonly title: string;
  readonly project: string;
  readonly status: TestResult['status'];
  readonly durationMs: number;
}

/**
 * Custom Playwright reporter producing a run summary (console + summary.json).
 * Playwright instantiates one reporter for the whole run and drives the
 * onBegin → onTestEnd* → onEnd lifecycle below.
 */
export default class SummaryReporter implements Reporter {
  private readonly records: TestRecord[] = [];
  private startedAt = 0;

  /** Lifecycle start: stamp the wall-clock start time for the run. */
  public onBegin(_config: FullConfig, _suite: Suite): void {
    this.startedAt = Date.now();
  }

  /** Per-test callback: record one finished test's outcome and duration. */
  public onTestEnd(test: TestCase, result: TestResult): void {
    this.records.push({
      title: test.title,
      project: test.parent.project()?.name ?? 'unknown',
      status: result.status,
      durationMs: result.duration,
    });
  }

  /**
   * Lifecycle end: aggregate all recorded tests into totals, pass rate, the
   * five slowest tests, and the failure list; persist reports/summary.json and
   * print the human-readable summary block.
   */
  public onEnd(result: FullResult): void {
    const total = this.records.length;
    const passed = this.records.filter((r) => r.status === 'passed').length;
    const failed = this.records.filter(
      (r) => r.status === 'failed' || r.status === 'timedOut',
    ).length;
    const skipped = this.records.filter((r) => r.status === 'skipped').length;
    const flaky = this.records.filter((r) => r.status === 'interrupted').length;
    const passRate = total > 0 ? ((passed / (total - skipped || 1)) * 100).toFixed(1) : '0';
    const wallClockMs = Date.now() - this.startedAt;

    const slowest = [...this.records]
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 5)
      .map((r) => ({ title: r.title, project: r.project, durationMs: r.durationMs }));

    const failures = this.records
      .filter((r) => r.status === 'failed' || r.status === 'timedOut')
      .map((r) => ({ title: r.title, project: r.project }));

    const summary = {
      result: result.status,
      totals: { total, passed, failed, skipped, flaky },
      passRatePercent: Number(passRate),
      wallClockMs,
      slowest,
      failures,
    };

    const outDir = path.resolve(process.cwd(), 'reports');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

    // Human-readable console block.
    const line = '─'.repeat(56);
    process.stdout.write(
      `\n${line}\n  RUN SUMMARY  (${result.status.toUpperCase()})\n${line}\n` +
        `  Total: ${total}   Passed: ${passed}   Failed: ${failed}   Skipped: ${skipped}\n` +
        `  Pass rate: ${passRate}%   Wall clock: ${(wallClockMs / 1000).toFixed(1)}s\n`,
    );
    if (slowest.length > 0) {
      process.stdout.write(`  Slowest:\n`);
      for (const s of slowest) {
        process.stdout.write(
          `    • ${(s.durationMs / 1000).toFixed(2)}s  [${s.project}] ${s.title}\n`,
        );
      }
    }
    if (failures.length > 0) {
      process.stdout.write(`  Failures:\n`);
      for (const f of failures) process.stdout.write(`    ✘ [${f.project}] ${f.title}\n`);
    }
    process.stdout.write(`${line}\n  → reports/summary.json\n${line}\n\n`);
  }
}
