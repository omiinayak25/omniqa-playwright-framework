/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Performance
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel (re-export) module for the performance package so callers use a
 * single, stable import path.
 *
 * Responsibilities:
 * - Re-export the collector, assertions, reporter, Lighthouse runner, and types.
 *
 * Used By:
 * perf.fixtures.ts and any code consuming the performance layer directly.
 *
 * Dependencies:
 * The sibling performance-* modules it re-exports.
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Mirrors the @utils/@accessibility/@visual barrel convention so performance
 * imports stay short and stable even if a file is later split or moved.
 * --------------------------------------------------------
 */
export { PerformanceCollector } from '@performance/performance-collector';
export { PerformanceAssertions } from '@performance/performance-assertions';
export { PerformanceReporter } from '@performance/performance-reporter';
export { LighthouseRunner } from '@performance/lighthouse-runner';
export * from '@performance/performance.types';
