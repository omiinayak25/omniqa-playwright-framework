/**
 * --------------------------------------------------------
 * File: performance-reporter.ts
 * Module: Performance
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Persistence + presentation for performance captures. Writes a JSON artifact
 * per capture, attaches a JSON + HTML summary to the current test, and keeps a
 * rolling reports/performance/index.html dashboard.
 *
 * Responsibilities:
 * - Write one JSON file per capture under reports/performance/results.
 * - Attach JSON + a readable metrics/budget table to the test.
 * - Regenerate an aggregate dashboard from all capture files (cross-worker).
 *
 * Used By:
 * performance-assertions.ts (records every gated capture), perf.fixtures.ts.
 *
 * Dependencies:
 * Playwright TestInfo, node:fs, node:path, winston Logger,
 * scopedLogger (@utils/logger), PERF_REPORT_DIR (@constants/paths.constants),
 * performance.types.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Filesystem work is best-effort and wrapped so reporting can NEVER fail a
 * test. The dashboard is rebuilt by reading the results directory so it stays
 * correct across parallel workers (same approach as the a11y reporter).
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TestInfo } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import { PERF_REPORT_DIR } from '@constants/paths.constants';
import type { BudgetViolation, PerformanceMetrics } from '@performance/performance.types';

const RESULTS_DIR = path.join(PERF_REPORT_DIR, 'results');

/** A persisted capture: the metrics plus the budget verdict at capture time. */
interface PerfRecord {
  readonly metrics: PerformanceMetrics;
  readonly violations: readonly BudgetViolation[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * PerformanceReporter persists + presents captures for ONE test. Built per test
 * from that test's TestInfo so attachments land on the right report node.
 */
export class PerformanceReporter {
  private readonly testInfo: TestInfo;
  private readonly log: Logger;
  private sequence = 0;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
    this.log = scopedLogger('PerfReporter');
  }

  /**
   * Purpose: Persist + attach a capture (+ its budget verdict), refresh dashboard.
   * @param metrics - The captured metrics.
   * @param violations - Budget breaches recorded at capture time (may be empty).
   * @returns Promise that resolves once artifacts are written/attached.
   */
  public async record(
    metrics: PerformanceMetrics,
    violations: readonly BudgetViolation[] = [],
  ): Promise<void> {
    this.sequence += 1;
    const payload: PerfRecord = { metrics, violations };
    try {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
      const base = `${slugify(this.testInfo.title)}-${this.sequence}-${slugify(metrics.label)}`;
      const jsonPath = path.join(RESULTS_DIR, `${base}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf-8');

      await this.testInfo.attach(`perf · ${metrics.label} (json)`, {
        path: jsonPath,
        contentType: 'application/json',
      });
      await this.testInfo.attach(`perf · ${metrics.label} (summary)`, {
        body: this.renderHtml(payload),
        contentType: 'text/html',
      });
      this.regenerateIndex();
    } catch (error) {
      this.log.warn(`Failed to record perf report: ${(error as Error).message}`);
    }
  }

  // ----------------------------------------------------------------- internals

  private renderHtml(record: PerfRecord): string {
    const { metrics, violations } = record;
    const breached = new Set(violations.map((v) => v.metric));
    const row = (metric: string, label: string, value: string): string =>
      `<tr class="${breached.has(metric) ? 'bad' : ''}"><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`;
    const metricsTable = [
      row('ttfbMs', 'TTFB', `${metrics.ttfbMs} ms`),
      row('domContentLoadedMs', 'DOMContentLoaded', `${metrics.domContentLoadedMs} ms`),
      row('loadMs', 'Load', `${metrics.loadMs} ms`),
      row('fcpMs', 'First Contentful Paint', `${metrics.fcpMs} ms`),
      row('lcpMs', 'Largest Contentful Paint', `${metrics.lcpMs} ms`),
      row('resourceCount', 'Resources', `${metrics.resources.count}`),
      row(
        'transferBytes',
        'Transferred',
        `${Math.round(metrics.resources.transferBytes / 1024)} KB`,
      ),
    ].join('');
    const netTable =
      `<tr><td>DNS</td><td>${metrics.network.dnsMs} ms</td></tr>` +
      `<tr><td>TCP</td><td>${metrics.network.tcpMs} ms</td></tr>` +
      `<tr><td>TLS</td><td>${metrics.network.tlsMs} ms</td></tr>` +
      `<tr><td>Request</td><td>${metrics.network.requestMs} ms</td></tr>` +
      `<tr><td>Response</td><td>${metrics.network.responseMs} ms</td></tr>`;
    const violationsHtml =
      violations.length === 0
        ? `<p class="pass">Within budget.</p>`
        : `<ul class="viol">${violations
            .map(
              (v) =>
                `<li>${escapeHtml(v.metric)}: ${v.actual}${v.unit} &gt; budget ${v.budget}${v.unit}</li>`,
            )
            .join('')}</ul>`;
    return `${STYLE}
      <h2>${escapeHtml(metrics.label)}</h2>
      <p class="meta">${escapeHtml(metrics.url)} — ${escapeHtml(metrics.timestamp)}</p>
      ${violationsHtml}
      <h3>Core metrics</h3><table>${metricsTable}</table>
      <h3>Network phases</h3><table>${netTable}</table>`;
  }

  private regenerateIndex(): void {
    const files = fs
      .readdirSync(RESULTS_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();
    const records: PerfRecord[] = [];
    for (const file of files) {
      try {
        records.push(
          JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, file), 'utf-8')) as PerfRecord,
        );
      } catch {
        /* skip a partially-written file from a concurrent worker */
      }
    }
    const rows = records
      .map((r) => {
        const m = r.metrics;
        return `<tr class="${r.violations.length === 0 ? 'ok' : 'bad'}">
          <td>${escapeHtml(m.label)}</td>
          <td>${m.ttfbMs}</td><td>${m.domContentLoadedMs}</td><td>${m.loadMs}</td>
          <td>${m.fcpMs}</td><td>${m.lcpMs}</td>
          <td>${m.resources.count}</td><td>${Math.round(m.resources.transferBytes / 1024)}</td>
          <td>${r.violations.length === 0 ? '✓' : `✘ ${r.violations.length}`}</td>
        </tr>`;
      })
      .join('');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
      <title>Performance Report</title>${STYLE}</head><body>
      <h1>Performance Report</h1>
      <p class="meta">${records.length} capture(s) — values in ms unless noted</p>
      <table>
        <thead><tr><th>Screen</th><th>TTFB</th><th>DCL</th><th>Load</th><th>FCP</th><th>LCP</th><th>Res</th><th>KB</th><th>Budget</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></body></html>`;
    fs.writeFileSync(path.join(PERF_REPORT_DIR, 'index.html'), html, 'utf-8');
  }
}

const STYLE = `<style>
  body{font-family:system-ui,Arial,sans-serif;margin:1.5rem;color:#1a1a1a}
  h1,h2,h3{font-weight:600}
  table{border-collapse:collapse;margin:.4rem 0 1rem;min-width:320px}
  th,td{border:1px solid #ddd;padding:.35rem .6rem;text-align:left;font-size:.85rem}
  th{background:#f4f4f5}
  .meta{color:#666;font-size:.82rem;margin:.2rem 0}
  .pass{color:#15803d;font-weight:600}
  .viol{color:#b91c1c;margin:.3rem 0}
  tr.bad td{background:#fef2f2}
  tr.ok td:last-child{color:#15803d;font-weight:700}
  tr.bad td:last-child{color:#b91c1c;font-weight:700}
</style>`;
