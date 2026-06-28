/**
 * --------------------------------------------------------
 * File: accessibility-reporter.ts
 * Module: Accessibility
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Persistence + presentation for accessibility scans. Turns a normalised
 * `A11yScanResult` into (a) a JSON artifact on disk, (b) attachments visible
 * in the Playwright HTML report and Allure, and (c) a rolling `index.html`
 * dashboard aggregating every scan in the run.
 *
 * Responsibilities:
 * - Write one JSON file per scan under reports/accessibility/results.
 * - Attach a JSON + human-readable HTML summary to the current test.
 * - Regenerate an aggregate index.html from all result files (cross-worker).
 *
 * Used By:
 * accessibility-assertions.ts (records every asserted scan), a11y.fixtures.ts
 * (DI — built from the test's TestInfo).
 *
 * Dependencies:
 * Playwright TestInfo, node:fs, node:path, winston Logger,
 * scopedLogger (@utils/logger), A11Y_REPORT_DIR (@constants/paths.constants),
 * accessibility.types.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * All filesystem work is best-effort and wrapped so a reporting failure can
 * NEVER fail a test (reporting is a side-channel, not a test outcome). The
 * dashboard is rebuilt by reading the results directory so it stays correct
 * even when tests run across multiple parallel worker processes.
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TestInfo } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import { A11Y_REPORT_DIR } from '@constants/paths.constants';
import type { A11yScanResult } from '@accessibility/accessibility.types';

const RESULTS_DIR = path.join(A11Y_REPORT_DIR, 'results');

/** Escape a string for safe interpolation into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Make a label safe to use as a filename fragment. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * AccessibilityReporter persists and presents scan results for ONE test. It is
 * built per test (TEST-scoped) from that test's TestInfo so attachments land
 * on the right report node.
 */
export class AccessibilityReporter {
  private readonly testInfo: TestInfo;
  private readonly log: Logger;
  private sequence = 0;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
    this.log = scopedLogger('A11yReporter');
  }

  /**
   * Purpose: Persist + attach a scan result and refresh the dashboard.
   * @param result - The normalised scan result to record.
   * @returns Promise that resolves once artifacts are written/attached.
   */
  public async record(result: A11yScanResult): Promise<void> {
    this.sequence += 1;
    try {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
      const base = `${slugify(this.testInfo.title)}-${this.sequence}-${slugify(result.label)}`;
      const jsonPath = path.join(RESULTS_DIR, `${base}.json`);
      const payload = this.toPersistable(result);
      fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf-8');

      await this.testInfo.attach(`a11y · ${result.label} (json)`, {
        path: jsonPath,
        contentType: 'application/json',
      });
      await this.testInfo.attach(`a11y · ${result.label} (summary)`, {
        body: this.renderResultHtml(result),
        contentType: 'text/html',
      });

      this.regenerateIndex();
    } catch (error) {
      // Reporting is a side-channel: never let it fail the test.
      this.log.warn(`Failed to record a11y report: ${(error as Error).message}`);
    }
  }

  // ----------------------------------------------------------------- internals

  /** Trim the raw axe payload off before writing (kept only in-memory). */
  private toPersistable(result: A11yScanResult): Omit<A11yScanResult, 'raw'> {
    const { raw: _raw, ...rest } = result;
    void _raw;
    return rest;
  }

  private renderResultHtml(result: A11yScanResult): string {
    const rows = result.violations
      .map(
        (v) => `
        <tr>
          <td><span class="impact ${v.impact}">${escapeHtml(v.impact)}</span></td>
          <td><a href="${escapeHtml(v.helpUrl)}" target="_blank" rel="noopener">${escapeHtml(v.id)}</a></td>
          <td>${escapeHtml(v.help)}</td>
          <td>${v.nodes.length}</td>
          <td><code>${escapeHtml(v.nodes.map((n) => n.target).join('\n'))}</code></td>
        </tr>`,
      )
      .join('');
    const body =
      result.violations.length === 0
        ? `<p class="pass">No accessibility violations. ${result.passCount} checks passed.</p>`
        : `<table>
            <thead><tr><th>Impact</th><th>Rule</th><th>Help</th><th>Nodes</th><th>Targets</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
    return `${STYLE}
      <h2>${escapeHtml(result.label)}</h2>
      <p class="meta">${escapeHtml(result.url)} — ${escapeHtml(result.timestamp)}</p>
      <p class="meta">critical=${result.counts.critical} · serious=${result.counts.serious} · moderate=${result.counts.moderate} · minor=${result.counts.minor} · incomplete=${result.incompleteCount}</p>
      ${body}`;
  }

  /** Rebuild index.html from every result JSON (correct across workers). */
  private regenerateIndex(): void {
    const files = fs
      .readdirSync(RESULTS_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();
    const summaries: Array<Omit<A11yScanResult, 'raw'>> = [];
    for (const file of files) {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, file), 'utf-8')) as Omit<
          A11yScanResult,
          'raw'
        >;
        summaries.push(parsed);
      } catch {
        /* skip a partially-written file from a concurrent worker */
      }
    }

    const totalViolations = summaries.reduce((sum, s) => sum + s.violations.length, 0);
    const rows = summaries
      .map(
        (s) => `
        <tr class="${s.violations.length === 0 ? 'ok' : 'bad'}">
          <td>${escapeHtml(s.label)}</td>
          <td>${s.violations.length}</td>
          <td>${s.counts.critical}</td>
          <td>${s.counts.serious}</td>
          <td>${s.counts.moderate}</td>
          <td>${s.counts.minor}</td>
          <td>${s.passCount}</td>
          <td><a href="${escapeHtml(`${path.relative(A11Y_REPORT_DIR, RESULTS_DIR)}/${slugify(s.label)}`)}.json">json</a></td>
        </tr>`,
      )
      .join('');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
      <title>Accessibility Report</title>${STYLE}</head><body>
      <h1>Accessibility Report</h1>
      <p class="meta">${summaries.length} scan(s) · ${totalViolations} total violation(s)</p>
      <table>
        <thead><tr><th>Screen</th><th>Violations</th><th>Critical</th><th>Serious</th><th>Moderate</th><th>Minor</th><th>Passes</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></body></html>`;
    fs.writeFileSync(path.join(A11Y_REPORT_DIR, 'index.html'), html, 'utf-8');
  }
}

/** Shared inline stylesheet for the attachments and dashboard. */
const STYLE = `<style>
  body{font-family:system-ui,Arial,sans-serif;margin:1.5rem;color:#1a1a1a}
  h1,h2{font-weight:600}
  table{border-collapse:collapse;width:100%;margin-top:.5rem}
  th,td{border:1px solid #ddd;padding:.4rem .6rem;text-align:left;font-size:.86rem;vertical-align:top}
  th{background:#f4f4f5}
  code{white-space:pre-wrap;font-size:.78rem}
  .meta{color:#666;font-size:.82rem;margin:.2rem 0}
  .pass{color:#15803d;font-weight:600}
  tr.ok td:nth-child(2){color:#15803d;font-weight:600}
  tr.bad td:nth-child(2){color:#b91c1c;font-weight:700}
  .impact{padding:.05rem .4rem;border-radius:.3rem;font-size:.72rem;text-transform:uppercase;color:#fff}
  .impact.critical{background:#b91c1c}.impact.serious{background:#c2410c}
  .impact.moderate{background:#a16207}.impact.minor{background:#4b5563}.impact.unknown{background:#9ca3af}
</style>`;
