/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Constants
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel export for all constant modules so consumers import from a single
 * place: `import { HttpStatus, TIMEOUTS, SAUCEDEMO_ROUTES } from '@constants/index'`.
 *
 * Responsibilities:
 * - Re-export every constants module under one entry point.
 *
 * Used By:
 * Any module consuming framework constants.
 *
 * Dependencies:
 * The sibling *.constants modules it re-exports.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Centralized so import paths stay stable even if a constant moves files.
 * --------------------------------------------------------
 */
export * from '@constants/timeouts.constants';
export * from '@constants/http.constants';
export * from '@constants/ui-routes.constants';
export * from '@constants/products.constants';
