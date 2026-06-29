# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance/orangehrm/login.perf.spec.ts >> OrangeHRM · Login · Performance @perf >> @smoke login screen loads within the SPA budget
- Location: tests/performance/orangehrm/login.perf.spec.ts:44:7

# Error details

```
Error: OrangeHRM · Login: 1 budget breach(es):
  • ttfbMs: 5058ms exceeds budget 5000ms

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"actual": 5058, "budget": 5000, "metric": "ttfbMs", "unit": "ms"}]
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: "Username : Admin"
          - paragraph [ref=e15]: "Password : admin123"
        - generic [ref=e16]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: 
              - generic [ref=e21]: Username
            - textbox "Username" [active] [ref=e23]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
          - button "Login" [ref=e32] [cursor=pointer]
          - paragraph [ref=e34] [cursor=pointer]: Forgot your password?
      - generic [ref=e35]:
        - generic [ref=e36]:
          - link [ref=e37] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e40] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e43] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e46] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e49]:
          - paragraph [ref=e50]: OrangeHRM OS 5.8
          - paragraph [ref=e51]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e52] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e54]
```

# Test source

```ts
  1   | /**
  2   |  * --------------------------------------------------------
  3   |  * File: performance-assertions.ts
  4   |  * Module: Performance
  5   |  * Project: OMINQA Playwright Framework
  6   |  *
  7   |  * Purpose:
  8   |  * Intention-revealing performance-budget assertions. Composes the collector
  9   |  * and reporter so a spec reads as intent ("expect the inventory page within
  10  |  * budget") instead of timing-API plumbing.
  11  |  *
  12  |  * Responsibilities:
  13  |  * - Merge a per-call budget with the env-driven defaults (config.performance).
  14  |  * - Evaluate metrics against the budget into typed violations (pure).
  15  |  * - Collect + record + assert in one call; plus result-only assertions.
  16  |  *
  17  |  * Used By:
  18  |  * perf.fixtures.ts (DI as the `perfAssert` fixture), tests/performance/**.
  19  |  *
  20  |  * Dependencies:
  21  |  * Playwright expect, performance-collector, performance-reporter, config,
  22  |  * performance.types.
  23  |  *
  24  |  * Last Updated: 2026-06-28
  25  |  * Notes:
  26  |  * The ONLY performance collaborator that calls `expect`. Records the capture
  27  |  * (with its verdict) BEFORE asserting, so a failing budget still produces its
  28  |  * artifact + attachment.
  29  |  * --------------------------------------------------------
  30  |  */
  31  | import { expect } from '@playwright/test';
  32  | import { config } from '@config/config';
  33  | import type { PerformanceCollector } from '@performance/performance-collector';
  34  | import type { PerformanceReporter } from '@performance/performance-reporter';
  35  | import type {
  36  |   BudgetViolation,
  37  |   PerformanceBudget,
  38  |   PerformanceMetrics,
  39  | } from '@performance/performance.types';
  40  | 
  41  | /** A check definition: which metric, its value, the limit, and the unit. */
  42  | interface BudgetCheck {
  43  |   readonly metric: string;
  44  |   readonly actual: number;
  45  |   readonly budget: number;
  46  |   readonly unit: 'ms' | 'bytes' | 'count';
  47  |   /** Paint metrics may be -1 (unavailable) — skip those. */
  48  |   readonly skipIfNegative?: boolean;
  49  | }
  50  | 
  51  | /**
  52  |  * PerformanceAssertions turns a capture into a pass/fail budget verdict.
  53  |  * TEST-scoped; receives its collaborators via constructor injection.
  54  |  */
  55  | export class PerformanceAssertions {
  56  |   private readonly collector: PerformanceCollector;
  57  |   private readonly reporter: PerformanceReporter;
  58  | 
  59  |   constructor(collector: PerformanceCollector, reporter: PerformanceReporter) {
  60  |     this.collector = collector;
  61  |     this.reporter = reporter;
  62  |   }
  63  | 
  64  |   /**
  65  |    * Purpose: Capture the current page, record it, and assert it meets budget.
  66  |    * @param label - Human label for the captured screen.
  67  |    * @param budget - Optional per-call overrides (merged over config defaults).
  68  |    * @returns The captured metrics (for further inspection).
  69  |    */
  70  |   public async expectWithinBudget(
  71  |     label: string,
  72  |     budget: PerformanceBudget = {},
  73  |   ): Promise<PerformanceMetrics> {
  74  |     const metrics = await this.collector.collect(label);
  75  |     const violations = this.evaluateBudget(metrics, budget);
  76  |     await this.reporter.record(metrics, violations);
> 77  |     expect(violations, this.describe(label, violations)).toHaveLength(0);
      |                                                          ^ Error: OrangeHRM · Login: 1 budget breach(es):
  78  |     return metrics;
  79  |   }
  80  | 
  81  |   /**
  82  |    * Purpose: Assert an already-captured metrics object meets budget (records it).
  83  |    * @param metrics - Metrics previously produced by the collector.
  84  |    * @param budget - Optional per-call overrides.
  85  |    */
  86  |   public async expectMetricsWithinBudget(
  87  |     metrics: PerformanceMetrics,
  88  |     budget: PerformanceBudget = {},
  89  |   ): Promise<void> {
  90  |     const violations = this.evaluateBudget(metrics, budget);
  91  |     await this.reporter.record(metrics, violations);
  92  |     expect(violations, this.describe(metrics.label, violations)).toHaveLength(0);
  93  |   }
  94  | 
  95  |   /**
  96  |    * Purpose: Pure budget evaluation (no assertion, no I/O).
  97  |    * @param metrics - The captured metrics.
  98  |    * @param budget - Per-call overrides merged over config defaults.
  99  |    * @returns The list of breached thresholds (empty when within budget).
  100 |    */
  101 |   public evaluateBudget(
  102 |     metrics: PerformanceMetrics,
  103 |     budget: PerformanceBudget = {},
  104 |   ): BudgetViolation[] {
  105 |     const b = { ...config.performance.budget, ...this.definedOnly(budget) };
  106 |     const checks: readonly BudgetCheck[] = [
  107 |       { metric: 'ttfbMs', actual: metrics.ttfbMs, budget: b.maxTtfbMs, unit: 'ms' },
  108 |       {
  109 |         metric: 'domContentLoadedMs',
  110 |         actual: metrics.domContentLoadedMs,
  111 |         budget: b.maxDomContentLoadedMs,
  112 |         unit: 'ms',
  113 |       },
  114 |       { metric: 'loadMs', actual: metrics.loadMs, budget: b.maxLoadMs, unit: 'ms' },
  115 |       {
  116 |         metric: 'fcpMs',
  117 |         actual: metrics.fcpMs,
  118 |         budget: b.maxFcpMs,
  119 |         unit: 'ms',
  120 |         skipIfNegative: true,
  121 |       },
  122 |       {
  123 |         metric: 'lcpMs',
  124 |         actual: metrics.lcpMs,
  125 |         budget: b.maxLcpMs,
  126 |         unit: 'ms',
  127 |         skipIfNegative: true,
  128 |       },
  129 |       {
  130 |         metric: 'transferBytes',
  131 |         actual: metrics.resources.transferBytes,
  132 |         budget: b.maxTransferBytes,
  133 |         unit: 'bytes',
  134 |       },
  135 |       {
  136 |         metric: 'resourceCount',
  137 |         actual: metrics.resources.count,
  138 |         budget: b.maxResourceCount,
  139 |         unit: 'count',
  140 |       },
  141 |     ];
  142 |     const violations: BudgetViolation[] = [];
  143 |     for (const check of checks) {
  144 |       if (check.skipIfNegative === true && check.actual < 0) continue;
  145 |       if (check.actual > check.budget) {
  146 |         violations.push({
  147 |           metric: check.metric,
  148 |           actual: check.actual,
  149 |           budget: check.budget,
  150 |           unit: check.unit,
  151 |         });
  152 |       }
  153 |     }
  154 |     return violations;
  155 |   }
  156 | 
  157 |   // ----------------------------------------------------------------- internals
  158 | 
  159 |   /** Strip undefined keys so spread overrides never blank a config default. */
  160 |   private definedOnly(budget: PerformanceBudget): Partial<PerformanceBudget> {
  161 |     const out: Record<string, number> = {};
  162 |     for (const [key, value] of Object.entries(budget)) {
  163 |       if (typeof value === 'number') out[key] = value;
  164 |     }
  165 |     return out as Partial<PerformanceBudget>;
  166 |   }
  167 | 
  168 |   /** Build a readable failure message from budget violations. */
  169 |   private describe(label: string, violations: readonly BudgetViolation[]): string {
  170 |     if (violations.length === 0) return `${label}: within performance budget`;
  171 |     const lines = violations.map(
  172 |       (v) => `  • ${v.metric}: ${v.actual}${v.unit} exceeds budget ${v.budget}${v.unit}`,
  173 |     );
  174 |     return `${label}: ${violations.length} budget breach(es):\n${lines.join('\n')}`;
  175 |   }
  176 | }
  177 | 
```