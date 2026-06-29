/**
 * --------------------------------------------------------
 * File: performance-assertions.ts
 * Module: Performance
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Intention-revealing performance-budget assertions. Composes the collector
 * and reporter so a spec reads as intent ("expect the inventory page within
 * budget") instead of timing-API plumbing.
 *
 * Responsibilities:
 * - Merge a per-call budget with the env-driven defaults (config.performance).
 * - Evaluate metrics against the budget into typed violations (pure).
 * - Collect + record + assert in one call; plus result-only assertions.
 *
 * Used By:
 * perf.fixtures.ts (DI as the `perfAssert` fixture), tests/performance/**.
 *
 * Dependencies:
 * Playwright expect, performance-collector, performance-reporter, config,
 * performance.types.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * The ONLY performance collaborator that calls `expect`. Records the capture
 * (with its verdict) BEFORE asserting, so a failing budget still produces its
 * artifact + attachment.
 * --------------------------------------------------------
 */
import { expect } from '@playwright/test';
import { config } from '@config/config';
import type { PerformanceCollector } from '@performance/performance-collector';
import type { PerformanceReporter } from '@performance/performance-reporter';
import type {
  BudgetViolation,
  PerformanceBudget,
  PerformanceMetrics,
} from '@performance/performance.types';

/** A check definition: which metric, its value, the limit, and the unit. */
interface BudgetCheck {
  readonly metric: string;
  readonly actual: number;
  readonly budget: number;
  readonly unit: 'ms' | 'bytes' | 'count';
  /** Paint metrics may be -1 (unavailable) — skip those. */
  readonly skipIfNegative?: boolean;
}

/**
 * PerformanceAssertions turns a capture into a pass/fail budget verdict.
 * TEST-scoped; receives its collaborators via constructor injection.
 */
export class PerformanceAssertions {
  private readonly collector: PerformanceCollector;
  private readonly reporter: PerformanceReporter;

  constructor(collector: PerformanceCollector, reporter: PerformanceReporter) {
    this.collector = collector;
    this.reporter = reporter;
  }

  /**
   * Purpose: Capture the current page, record it, and assert it meets budget.
   * @param label - Human label for the captured screen.
   * @param budget - Optional per-call overrides (merged over config defaults).
   * @returns The captured metrics (for further inspection).
   */
  public async expectWithinBudget(
    label: string,
    budget: PerformanceBudget = {},
  ): Promise<PerformanceMetrics> {
    const metrics = await this.collector.collect(label);
    const violations = this.evaluateBudget(metrics, budget);
    await this.reporter.record(metrics, violations);
    expect(violations, this.describe(label, violations)).toHaveLength(0);
    return metrics;
  }

  /**
   * Purpose: Assert an already-captured metrics object meets budget (records it).
   * @param metrics - Metrics previously produced by the collector.
   * @param budget - Optional per-call overrides.
   */
  public async expectMetricsWithinBudget(
    metrics: PerformanceMetrics,
    budget: PerformanceBudget = {},
  ): Promise<void> {
    const violations = this.evaluateBudget(metrics, budget);
    await this.reporter.record(metrics, violations);
    expect(violations, this.describe(metrics.label, violations)).toHaveLength(0);
  }

  /**
   * Purpose: Pure budget evaluation (no assertion, no I/O).
   * @param metrics - The captured metrics.
   * @param budget - Per-call overrides merged over config defaults.
   * @returns The list of breached thresholds (empty when within budget).
   */
  public evaluateBudget(
    metrics: PerformanceMetrics,
    budget: PerformanceBudget = {},
  ): BudgetViolation[] {
    const b = { ...config.performance.budget, ...this.definedOnly(budget) };
    const checks: readonly BudgetCheck[] = [
      { metric: 'ttfbMs', actual: metrics.ttfbMs, budget: b.maxTtfbMs, unit: 'ms' },
      {
        metric: 'domContentLoadedMs',
        actual: metrics.domContentLoadedMs,
        budget: b.maxDomContentLoadedMs,
        unit: 'ms',
      },
      { metric: 'loadMs', actual: metrics.loadMs, budget: b.maxLoadMs, unit: 'ms' },
      {
        metric: 'fcpMs',
        actual: metrics.fcpMs,
        budget: b.maxFcpMs,
        unit: 'ms',
        skipIfNegative: true,
      },
      {
        metric: 'lcpMs',
        actual: metrics.lcpMs,
        budget: b.maxLcpMs,
        unit: 'ms',
        skipIfNegative: true,
      },
      {
        metric: 'transferBytes',
        actual: metrics.resources.transferBytes,
        budget: b.maxTransferBytes,
        unit: 'bytes',
      },
      {
        metric: 'resourceCount',
        actual: metrics.resources.count,
        budget: b.maxResourceCount,
        unit: 'count',
      },
    ];
    const violations: BudgetViolation[] = [];
    for (const check of checks) {
      if (check.skipIfNegative === true && check.actual < 0) continue;
      if (check.actual > check.budget) {
        violations.push({
          metric: check.metric,
          actual: check.actual,
          budget: check.budget,
          unit: check.unit,
        });
      }
    }
    return violations;
  }

  // ----------------------------------------------------------------- internals

  /** Strip undefined keys so spread overrides never blank a config default. */
  private definedOnly(budget: PerformanceBudget): Partial<PerformanceBudget> {
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(budget)) {
      if (typeof value === 'number') out[key] = value;
    }
    return out as Partial<PerformanceBudget>;
  }

  /** Build a readable failure message from budget violations. */
  private describe(label: string, violations: readonly BudgetViolation[]): string {
    if (violations.length === 0) return `${label}: within performance budget`;
    const lines = violations.map(
      (v) => `  • ${v.metric}: ${v.actual}${v.unit} exceeds budget ${v.budget}${v.unit}`,
    );
    return `${label}: ${violations.length} budget breach(es):\n${lines.join('\n')}`;
  }
}
