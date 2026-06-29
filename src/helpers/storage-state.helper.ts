/**
 * --------------------------------------------------------
 * File: storage-state.helper.ts
 * Module: Helpers
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Orchestrates reuse of saved authentication sessions (Playwright storageState).
 * Centralises the "does a session file exist? → produce the matching context
 * option" logic so hooks/specs don't re-implement file checks.
 *
 * Responsibilities:
 * - Report whether a given storage-state file exists.
 * - Build the BrowserContext option (storageState) when present, else empty.
 *
 * Used By:
 * src/cucumber/hooks (Before, @auth scenarios).
 *
 * Dependencies:
 * @playwright/test (BrowserContextOptions), @utils/file.util (fileExists).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Generic over the file path (works for any app's session, e.g. SAUCE/ORANGE)
 * — no per-app duplication.
 * --------------------------------------------------------
 */
import type { BrowserContextOptions } from '@playwright/test';
import { fileExists } from '@utils/file.util';
import type { Result } from '@apptypes/index';

/** Orchestrates Playwright storage-state reuse. */
export class StorageStateHelper {
  /** Whether a saved session file exists at `file`. */
  public static hasSession(file: string): boolean {
    return fileExists(file);
  }

  /**
   * Resolve a saved session as a discriminated Result: the file path on success,
   * or a reason on failure (lets callers branch without null-checks).
   */
  public static resolveSession(file: string): Result<string> {
    return StorageStateHelper.hasSession(file)
      ? { ok: true, value: file }
      : { ok: false, error: 'no saved session' };
  }

  /**
   * BrowserContext options that reuse `file` as the session when it exists,
   * otherwise an empty (clean) option object.
   */
  public static contextOptionsFor(file: string): BrowserContextOptions {
    const session = StorageStateHelper.resolveSession(file);
    return session.ok ? { storageState: session.value } : {};
  }
}
