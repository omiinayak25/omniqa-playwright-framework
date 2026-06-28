/**
 * --------------------------------------------------------
 * File: performance.types.ts
 * Module: Performance
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Type contracts for the performance smoke layer — the metric shapes captured
 * from the browser timing APIs, the budget used to gate them, and the
 * Lighthouse result shape. One typed surface so collector, assertions,
 * reporter, and specs agree (no `any`, no magic keys).
 *
 * Responsibilities:
 * - Define PerformanceMetrics (navigation/paint/LCP/network/resource summary).
 * - Define PerformanceBudget (all-optional override) + BudgetViolation.
 * - Define the normalised LighthouseSummary shape.
 *
 * Used By:
 * performance-collector.ts, performance-assertions.ts,
 * performance-reporter.ts, lighthouse-runner.ts, tests/performance/** specs.
 *
 * Dependencies:
 * None (pure types).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Metrics are framework-owned (normalised from the W3C Navigation/Resource/
 * Paint Timing APIs) so reports stay stable regardless of browser quirks.
 * --------------------------------------------------------
 */

/** Network phase breakdown (ms) derived from the navigation timing entry. */
export interface NetworkTiming {
  /** DNS lookup duration. */
  readonly dnsMs: number;
  /** TCP connect duration. */
  readonly tcpMs: number;
  /** TLS negotiation duration (0 when not HTTPS / reused). */
  readonly tlsMs: number;
  /** Request send → first response byte. */
  readonly requestMs: number;
  /** Response download duration. */
  readonly responseMs: number;
}

/** One resource bucket (by initiator type) within the resource summary. */
export interface ResourceBucket {
  /** Initiator type (script, css, img, fetch, …). */
  readonly type: string;
  /** Number of resources of this type. */
  readonly count: number;
  /** Total transferred bytes for this type. */
  readonly transferBytes: number;
}

/** A single slow resource called out in the summary. */
export interface SlowResource {
  /** Resource URL (trimmed). */
  readonly url: string;
  /** Wall-clock duration of the request (ms). */
  readonly durationMs: number;
  /** Transferred size (bytes). */
  readonly transferBytes: number;
}

/** Aggregated view of all network resources for the navigation. */
export interface ResourceSummary {
  /** Total number of resource requests. */
  readonly count: number;
  /** Total transferred bytes across all resources. */
  readonly transferBytes: number;
  /** Per-initiator-type breakdown (descending by transfer). */
  readonly byType: readonly ResourceBucket[];
  /** The few slowest resources (descending by duration). */
  readonly slowest: readonly SlowResource[];
}

/** The normalised set of metrics captured for one page state. */
export interface PerformanceMetrics {
  /** Human label for the captured screen/state. */
  readonly label: string;
  /** URL captured. */
  readonly url: string;
  /** ISO timestamp of capture. */
  readonly timestamp: string;
  /** Time to first byte (ms). */
  readonly ttfbMs: number;
  /** DOMContentLoaded from navigation start (ms). */
  readonly domContentLoadedMs: number;
  /** `load` event from navigation start (ms). */
  readonly loadMs: number;
  /** DOM interactive from navigation start (ms). */
  readonly domInteractiveMs: number;
  /** First Contentful Paint (ms); -1 when unavailable. */
  readonly fcpMs: number;
  /** Largest Contentful Paint (ms); -1 when unavailable. */
  readonly lcpMs: number;
  /** Network phase breakdown. */
  readonly network: NetworkTiming;
  /** Resource aggregation. */
  readonly resources: ResourceSummary;
}

/** All-optional budget; unspecified keys fall back to `config.performance`. */
export interface PerformanceBudget {
  readonly maxLoadMs?: number;
  readonly maxDomContentLoadedMs?: number;
  readonly maxTtfbMs?: number;
  readonly maxFcpMs?: number;
  readonly maxLcpMs?: number;
  readonly maxTransferBytes?: number;
  readonly maxResourceCount?: number;
}

/** A single breached budget threshold. */
export interface BudgetViolation {
  /** Metric key that breached (e.g. `loadMs`). */
  readonly metric: string;
  /** Observed value. */
  readonly actual: number;
  /** Threshold that was exceeded. */
  readonly budget: number;
  /** Unit for display (`ms` | `bytes` | `count`). */
  readonly unit: 'ms' | 'bytes' | 'count';
}

/** Normalised Lighthouse result (subset we assert + report on). */
export interface LighthouseSummary {
  readonly url: string;
  readonly timestamp: string;
  /** Performance category score (0–1). */
  readonly performanceScore: number;
  /** Key audit numeric values (ms / unitless), keyed by audit id. */
  readonly audits: Readonly<Record<string, number>>;
}
