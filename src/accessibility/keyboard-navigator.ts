/**
 * --------------------------------------------------------
 * File: keyboard-navigator.ts
 * Module: Accessibility
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Keyboard-operability helper. axe-core can flag focus-management RULE
 * problems but cannot prove a user can actually TAB to and operate the UI.
 * This class drives the real keyboard and reports what receives focus.
 *
 * Responsibilities:
 * - Press Tab/Shift+Tab and report a stable descriptor of the focused element.
 * - Determine whether a target selector is reachable within N tabs.
 * - Capture the observed focus order for assertions/reporting.
 *
 * Used By:
 * accessibility-assertions.ts (semantic keyboard assertions),
 * a11y.fixtures.ts (DI), tests/accessibility/** specs.
 *
 * Dependencies:
 * Playwright Page, winston Logger, scopedLogger (@utils/logger).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * This is a low-level DRIVER returning data (booleans/descriptors); it does
 * NOT assert. Assertions live in accessibility-assertions.ts so the helper
 * stays reusable in non-assertion contexts (e.g. capturing a focus trace).
 * --------------------------------------------------------
 */
import type { Page } from '@playwright/test';
import type { Logger } from 'winston';
import { scopedLogger } from '@utils/logger';

/** Stable, serialisable descriptor of whatever element currently has focus. */
export interface FocusedElement {
  /** Lower-case tag name (e.g. `input`), or `none` when nothing is focused. */
  readonly tag: string;
  /** Element id, when present. */
  readonly id: string;
  /** ARIA role (explicit or implicit), when resolvable. */
  readonly role: string;
  /** Accessible name (aria-label / text / value / placeholder), best-effort. */
  readonly name: string;
}

/**
 * KeyboardNavigator drives real keyboard navigation against the current page.
 * TEST-scoped (bound to one page) and stateless between calls.
 */
export class KeyboardNavigator {
  private readonly page: Page;
  private readonly log: Logger;

  constructor(page: Page) {
    this.page = page;
    this.log = scopedLogger('KeyboardNav');
  }

  /**
   * Purpose: Press Tab (or Shift+Tab) a number of times.
   * @param times - How many times to press (default 1).
   * @param reverse - When true, press Shift+Tab to move focus backwards.
   * @returns Promise resolving once all key presses complete.
   */
  public async tab(times = 1, reverse = false): Promise<void> {
    const key = reverse ? 'Shift+Tab' : 'Tab';
    for (let i = 0; i < times; i += 1) {
      await this.page.keyboard.press(key);
    }
  }

  /**
   * Purpose: Describe the element that currently holds focus.
   * @returns Promise resolving to a {@link FocusedElement} descriptor.
   */
  public async focused(): Promise<FocusedElement> {
    return this.page.evaluate<FocusedElement>(() => {
      const el = document.activeElement;
      if (el === null || el === document.body) {
        return { tag: 'none', id: '', role: '', name: '' };
      }
      const html = el as HTMLElement;
      const ariaLabel = html.getAttribute('aria-label') ?? '';
      const name =
        ariaLabel ||
        (html as HTMLInputElement).value ||
        html.getAttribute('placeholder') ||
        (html.textContent ?? '').trim();
      return {
        tag: html.tagName.toLowerCase(),
        id: html.id,
        role: html.getAttribute('role') ?? '',
        name: name.slice(0, 80),
      };
    });
  }

  /**
   * Purpose: Tab forward until a selector receives focus, or give up.
   * @param selector - CSS selector for the element that should gain focus.
   * @param maxTabs - Upper bound on Tab presses before declaring failure.
   * @returns Promise resolving true if the element was focused within maxTabs.
   */
  public async isReachableByTab(selector: string, maxTabs = 20): Promise<boolean> {
    for (let i = 0; i < maxTabs; i += 1) {
      await this.tab();
      if (await this.isFocused(selector)) {
        this.log.debug(`"${selector}" reachable after ${i + 1} tab(s)`);
        return true;
      }
    }
    this.log.warn(`"${selector}" not reachable within ${maxTabs} tab(s)`);
    return false;
  }

  /**
   * Purpose: Capture the focus order produced by pressing Tab `steps` times.
   * @param steps - Number of forward Tab presses to record.
   * @returns Promise resolving to the ordered focus descriptors observed.
   */
  public async captureFocusOrder(steps: number): Promise<readonly FocusedElement[]> {
    const order: FocusedElement[] = [];
    for (let i = 0; i < steps; i += 1) {
      await this.tab();
      order.push(await this.focused());
    }
    return order;
  }

  /** Purpose: Report whether a selector matches the currently focused element. */
  public async isFocused(selector: string): Promise<boolean> {
    return this.page.evaluate(
      (sel) => document.activeElement !== null && document.activeElement.matches(sel),
      selector,
    );
  }
}
