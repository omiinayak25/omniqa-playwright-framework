/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Types
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Single import surface (`@types`) for shared types: new cross-cutting
 * primitives PLUS re-exports of the canonical types that already live in their
 * owning modules (aggregation, not duplication).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
// New cross-cutting primitives.
export type { Maybe, DeepReadonly, Result } from '@apptypes/common.types';
export type { Environment, BrowserName, ExecutionContext } from '@apptypes/execution.types';

// Canonical types re-exported from their owning modules (no redefinition).
export type { ApiResponse } from '@models/api.model';
export type { PerformanceMetrics } from '@performance/performance.types';
export type { A11yScanResult as AccessibilityResult } from '@accessibility/accessibility.types';
