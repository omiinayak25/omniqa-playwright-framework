/**
 * --------------------------------------------------------
 * File: performance-collector.ts
 * Module: Performance
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Captures browser performance metrics for an already-loaded page from the
 * W3C Navigation / Paint / Resource Timing APIs plus a buffered
 * Largest-Contentful-Paint observer, and normalises them into a stable shape.
 *
 * Responsibilities:
 * - Read navigation timings (TTFB, DCL, load, interactive) + network phases.
 * - Read paint timings (FCP) and LCP (buffered PerformanceObserver).
 * - Aggregate resource timings (count, transfer, by-type, slowest).
 *
 * Used By:
 * performance-assertions.ts (composition), perf.fixtures.ts (DI),
 * tests/performance/** specs.
 *
 * Dependencies:
 * Playwright Page, winston Logger, scopedLogger (@utils/logger),
 * performance.types.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Single Responsibility: COLLECTS only — never asserts, never writes files.
 * Call AFTER navigation has settled (e.g. page object `isLoaded()` /
 * `waitForLoadState('load')`); the timing entries are buffered by Chromium so
 * reading them post-load is reliable for a smoke check.
 * --------------------------------------------------------
 */
import type { Page } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';
import type {
  NetworkTiming,
  PerformanceMetrics,
  ResourceBucket,
  ResourceSummary,
  SlowResource,
} from '@performance/performance.types';

/** Raw, serialisable payload returned from the in-page collection script. */
interface RawMetrics {
  readonly ttfbMs: number;
  readonly domContentLoadedMs: number;
  readonly loadMs: number;
  readonly domInteractiveMs: number;
  readonly fcpMs: number;
  readonly lcpMs: number;
  readonly network: NetworkTiming;
  readonly resources: {
    readonly count: number;
    readonly transferBytes: number;
    readonly byType: readonly ResourceBucket[];
    readonly slowest: readonly SlowResource[];
  };
}

/**
 * PerformanceCollector reads timing metrics from the current page. TEST-scoped
 * (bound to one page) and stateless between calls.
 */
export class PerformanceCollector {
  private readonly page: Page;
  private readonly log: Logger;

  constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger('Perf');
  }

  /**
   * Purpose: Capture + normalise performance metrics for the current page.
   * @param label - Human-readable name for the captured screen/state.
   * @param lcpSettleMs - How long to let the LCP observer settle (default 400).
   * @returns Promise resolving to the normalised {@link PerformanceMetrics}.
   */
  public async collect(label: string, lcpSettleMs = 400): Promise<PerformanceMetrics> {
    const raw = await this.page.evaluate(this.inPageScript, lcpSettleMs);
    const metrics: PerformanceMetrics = {
      label,
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      ttfbMs: raw.ttfbMs,
      domContentLoadedMs: raw.domContentLoadedMs,
      loadMs: raw.loadMs,
      domInteractiveMs: raw.domInteractiveMs,
      fcpMs: raw.fcpMs,
      lcpMs: raw.lcpMs,
      network: raw.network,
      resources: this.toResourceSummary(raw.resources),
    };
    this.log.info(
      `Perf "${label}": ttfb=${metrics.ttfbMs}ms dcl=${metrics.domContentLoadedMs}ms ` +
        `load=${metrics.loadMs}ms fcp=${metrics.fcpMs}ms lcp=${metrics.lcpMs}ms ` +
        `res=${metrics.resources.count} transfer=${Math.round(metrics.resources.transferBytes / 1024)}KB`,
    );
    return metrics;
  }

  /** Defensive copy/typing of the raw resource block into the public shape. */
  private toResourceSummary(raw: RawMetrics['resources']): ResourceSummary {
    return {
      count: raw.count,
      transferBytes: raw.transferBytes,
      byType: raw.byType,
      slowest: raw.slowest,
    };
  }

  /**
   * The function executed INSIDE the browser. Must be self-contained (it is
   * serialised and run in the page context, not in Node).
   */
  private inPageScript = async (lcpSettleMs: number): Promise<RawMetrics> => {
    const round = (n: number): number => Math.max(0, Math.round(n));

    // ---- Largest Contentful Paint (buffered observer) ----
    const lcpMs = await new Promise<number>((resolve) => {
      let value = -1;
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) value = entry.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(value);
        }, lcpSettleMs);
      } catch {
        resolve(-1);
      }
    });

    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    const paints = performance.getEntriesByType('paint');
    const fcpEntry = paints.find((p) => p.name === 'first-contentful-paint');

    const network: NetworkTiming = nav
      ? {
          dnsMs: round(nav.domainLookupEnd - nav.domainLookupStart),
          tcpMs: round(nav.connectEnd - nav.connectStart),
          tlsMs:
            nav.secureConnectionStart > 0 ? round(nav.connectEnd - nav.secureConnectionStart) : 0,
          requestMs: round(nav.responseStart - nav.requestStart),
          responseMs: round(nav.responseEnd - nav.responseStart),
        }
      : { dnsMs: 0, tcpMs: 0, tlsMs: 0, requestMs: 0, responseMs: 0 };

    // ---- Resource timing aggregation ----
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const buckets = new Map<string, { count: number; transferBytes: number }>();
    let transferBytes = 0;
    for (const r of resourceEntries) {
      transferBytes += r.transferSize;
      const key = r.initiatorType || 'other';
      const bucket = buckets.get(key) ?? { count: 0, transferBytes: 0 };
      bucket.count += 1;
      bucket.transferBytes += r.transferSize;
      buckets.set(key, bucket);
    }
    const byType = [...buckets.entries()]
      .map(([type, b]) => ({ type, count: b.count, transferBytes: b.transferBytes }))
      .sort((a, b) => b.transferBytes - a.transferBytes);
    const slowest = [...resourceEntries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((r) => ({
        url: r.name.length > 120 ? `${r.name.slice(0, 117)}...` : r.name,
        durationMs: round(r.duration),
        transferBytes: r.transferSize,
      }));

    return {
      ttfbMs: nav ? round(nav.responseStart) : -1,
      domContentLoadedMs: nav ? round(nav.domContentLoadedEventEnd) : -1,
      loadMs: nav ? round(nav.loadEventEnd) : -1,
      domInteractiveMs: nav ? round(nav.domInteractive) : -1,
      fcpMs: fcpEntry ? round(fcpEntry.startTime) : -1,
      lcpMs: lcpMs < 0 ? -1 : round(lcpMs),
      network,
      resources: { count: resourceEntries.length, transferBytes, byType, slowest },
    };
  };
}
