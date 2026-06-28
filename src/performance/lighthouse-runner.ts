/**
 * --------------------------------------------------------
 * File: lighthouse-runner.ts
 * Module: Performance
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Optional Lighthouse integration. Runs the Lighthouse CLI against a URL,
 * parses its JSON report, and normalises the performance score + key audits
 * into a stable {@link LighthouseSummary}.
 *
 * Responsibilities:
 * - Report whether Lighthouse auditing is enabled (config-gated).
 * - Spawn the Lighthouse CLI headless and capture its JSON report.
 * - Extract performance score + core-web-vital audits.
 *
 * Used By:
 * tests/performance/lighthouse.perf.spec.ts (skipped unless enabled).
 *
 * Dependencies:
 * node:child_process, node:fs, node:path, winston Logger,
 * scopedLogger (@utils/logger), config (@config/config),
 * PERF_REPORT_DIR (@constants/paths.constants), performance.types.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * We shell out to the CLI (via `npx lighthouse`) rather than importing the
 * package, because Lighthouse ships as pure ESM while this framework is
 * CommonJS — spawning sidesteps the interop friction and keeps Lighthouse a
 * truly OPTIONAL, heavy dependency that is only exercised when
 * `LIGHTHOUSE_ENABLED=true`. Requires a Chrome/Chromium binary on the host.
 * --------------------------------------------------------
 */
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import { config } from '@config/config';
import { PERF_REPORT_DIR } from '@constants/paths.constants';
import type { LighthouseSummary } from '@performance/performance.types';

/** Minimal shape of the slice of the Lighthouse JSON report we consume. */
interface LighthouseRawReport {
  readonly finalUrl?: string;
  readonly requestedUrl?: string;
  readonly fetchTime?: string;
  readonly categories?: { readonly performance?: { readonly score?: number | null } };
  readonly audits?: Record<string, { readonly numericValue?: number | null }>;
}

/** Audit ids surfaced in the normalised summary. */
const AUDIT_IDS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
] as const;

const LH_OUTPUT_DIR = path.join(PERF_REPORT_DIR, 'lighthouse');

/**
 * LighthouseRunner drives the Lighthouse CLI. WORKER/TEST-agnostic and
 * stateless; create one and call `audit()` per URL.
 */
export class LighthouseRunner {
  private readonly log: Logger;
  private readonly minScore = config.performance.lighthouse.minPerformanceScore;

  constructor() {
    this.log = scopedLogger('Lighthouse');
  }

  /** Purpose: Whether Lighthouse auditing is enabled (config/env gated). */
  public isEnabled(): boolean {
    return config.performance.lighthouse.enabled;
  }

  /** Purpose: The configured minimum acceptable performance score (0–1). */
  public minimumScore(): number {
    return this.minScore;
  }

  /**
   * Purpose: Audit a URL with Lighthouse and return a normalised summary.
   * @param url - Absolute URL to audit.
   * @param label - Slug used for the on-disk report file name.
   * @returns Promise resolving to the normalised {@link LighthouseSummary}.
   * @throws Error if the CLI fails or its JSON report cannot be read.
   */
  public async audit(url: string, label: string): Promise<LighthouseSummary> {
    fs.mkdirSync(LH_OUTPUT_DIR, { recursive: true });
    const outputPath = path.join(LH_OUTPUT_DIR, `${this.slugify(label)}.json`);
    const args = [
      '--yes',
      'lighthouse',
      url,
      '--quiet',
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    ];

    this.log.info(`Lighthouse audit: ${url}`);
    await this.spawnCli('npx', args);
    const raw = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as LighthouseRawReport;
    return this.normalise(url, raw);
  }

  // ----------------------------------------------------------------- internals

  private normalise(url: string, raw: LighthouseRawReport): LighthouseSummary {
    const audits: Record<string, number> = {};
    for (const id of AUDIT_IDS) {
      const value = raw.audits?.[id]?.numericValue;
      if (typeof value === 'number') audits[id] = Math.round(value);
    }
    return {
      url: raw.finalUrl ?? url,
      timestamp: raw.fetchTime ?? new Date().toISOString(),
      performanceScore: raw.categories?.performance?.score ?? 0,
      audits,
    };
  }

  private spawnCli(command: string, args: readonly string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, [...args], { shell: false });
      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) => reject(error));
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Lighthouse exited with code ${code}\n${stderr.slice(0, 600)}`));
      });
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }
}
