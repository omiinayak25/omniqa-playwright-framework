/**
 * --------------------------------------------------------
 * File: flaky-reporter.ts
 * Module: Custom Reporters
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * A custom Playwright reporter that detects FLAKY tests — those that failed at
 * least one attempt but ultimately passed on retry — and records them for
 * analytics + triage (the foundation of flaky-test quarantine).
 *
 * Responsibilities:
 * - Inspect every test's final outcome after the run.
 * - Emit reports/flaky.json (machine-readable) + a console callout.
 *
 * Used By:
 * playwright.config.ts (registered in the `reporter` array).
 *
 * Dependencies:
 * node:fs, node:path, @playwright/test/reporter.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Uses Playwright's own outcome classification: `test.outcome() === 'flaky'`
 * means the test produced both a failing and a passing result in the run
 * (i.e. it only went green after a retry). Retries are enabled in CI via
 * playwright.config, which is exactly where flaky detection matters.
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Reporter, FullConfig, Suite, TestCase } from '@playwright/test/reporter';

interface FlakyRecord {
  readonly title: string;
  readonly project: string;
  readonly location: string;
  readonly retries: number;
}

/** Custom reporter that surfaces flaky tests at the end of a run. */
export default class FlakyReporter implements Reporter {
  private suite: Suite | undefined;

  public onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  public onEnd(): void {
    const flaky: FlakyRecord[] = [];
    for (const test of this.suite?.allTests() ?? []) {
      if (test.outcome() === 'flaky') flaky.push(this.toRecord(test));
    }

    const outDir = path.resolve(process.cwd(), 'reports');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'flaky.json'),
      JSON.stringify({ count: flaky.length, flaky }, null, 2),
    );

    if (flaky.length > 0) {
      process.stdout.write(`\n  ⚠ FLAKY TESTS (${flaky.length}) — passed only after a retry:\n`);
      for (const f of flaky) {
        process.stdout.write(`    ~ [${f.project}] ${f.title}  (${f.location})\n`);
      }
      process.stdout.write('  → reports/flaky.json\n\n');
    }
  }

  private toRecord(test: TestCase): FlakyRecord {
    const file = path.relative(process.cwd(), test.location.file);
    return {
      title: test.title,
      project: test.parent.project()?.name ?? 'unknown',
      location: `${file}:${test.location.line}`,
      retries: test.results.length - 1,
    };
  }
}
