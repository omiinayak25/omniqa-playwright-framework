/**
 * --------------------------------------------------------
 * File: allure.util.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Thin, typed wrapper over allure-js-commons exposing labels, steps, and
 * attachments through ONE framework import.
 *
 * Responsibilities:
 * - `Severity` enum and the `Allure` object (severity/owner/epic/feature/
 *   story/tag/step/attach) over allure-js-commons.
 *
 * Used By:
 * Tests and page objects/fixtures that annotate Allure reports.
 *
 * Dependencies:
 * allure-js-commons
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: a single typed surface lets tests use one import and lets the
 * framework swap reporting backends later. WHEN: use to add metadata, wrap
 * reported steps, and attach content. LIMITATION: calls are safe even when
 * not running under the Allure reporter — they no-op gracefully.
 * --------------------------------------------------------
 */
import * as allure from 'allure-js-commons';

export enum Severity {
  BLOCKER = 'blocker',
  CRITICAL = 'critical',
  NORMAL = 'normal',
  MINOR = 'minor',
  TRIVIAL = 'trivial',
}

export const Allure = {
  severity: (level: Severity): PromiseLike<void> => allure.severity(level),
  owner: (name: string): PromiseLike<void> => allure.owner(name),
  epic: (name: string): PromiseLike<void> => allure.epic(name),
  feature: (name: string): PromiseLike<void> => allure.feature(name),
  story: (name: string): PromiseLike<void> => allure.story(name),
  tag: (name: string): PromiseLike<void> => allure.label('tag', name),

  /** Wrap a block as a named, reported step. */
  step: <T>(name: string, body: () => Promise<T>): PromiseLike<T> => allure.step(name, body),

  /** Attach arbitrary content to the current test. */
  attach: (name: string, content: string, type = 'text/plain'): PromiseLike<void> =>
    allure.attachment(name, content, type),
} as const;
