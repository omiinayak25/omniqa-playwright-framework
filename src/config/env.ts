/**
 * --------------------------------------------------------
 * File: env.ts
 * Module: Configuration
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Minimal, type-safe environment accessor. Loads `.env` once and exposes
 * typed getters so nothing in the framework reads `process.env` directly.
 *
 * Responsibilities:
 * - Load the project `.env` file a single time at import.
 * - Provide typed accessors (string/number/boolean, required/optional).
 * - Expose AppEnvironment and the resolved ACTIVE_ENV.
 *
 * Used By:
 * playwright.config.ts (bootstrap), @config/config.ts, and any module
 * needing a single, validated source of environment truth.
 *
 * Dependencies:
 * dotenv (loads .env), node:path (resolve .env location).
 *
 * Last Updated: 2026-06-27
 * Notes:
 * TYPED ACCESSOR pattern — process.env values are always raw strings (or
 * undefined). Instead of scattering `process.env.X` and ad-hoc casts/parsing
 * across the codebase, every read goes through one of these getters which
 * centralizes presence checks, type coercion, defaults, and fail-fast errors.
 * This is the lightweight bootstrap; the richer validated layer is config.ts.
 * --------------------------------------------------------
 */
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load the base .env file from the project root.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** Enumerates the supported deployment targets the framework can run against. */
export enum AppEnvironment {
  DEV = 'dev',
  QA = 'qa',
  UAT = 'uat',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * Read a required string environment variable.
 *
 * @param key Name of the environment variable to read.
 * @returns The non-empty string value of the variable.
 * @throws Error if the variable is unset or empty (fail-fast at load time).
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`[env] Missing required environment variable: "${key}"`);
  }
  return value;
}

/**
 * Read an optional string environment variable.
 *
 * @param key Name of the environment variable to read.
 * @param fallback Value returned when the variable is unset or empty.
 * @returns The variable's value, or `fallback` when absent/empty.
 */
export function getEnvOptional(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

/**
 * Read a numeric environment variable, coercing the raw string to a number.
 *
 * @param key Name of the environment variable to read.
 * @param fallback Value returned when the variable is unset, empty, or not a valid number.
 * @returns The parsed number, or `fallback` on absence/empty/NaN.
 */
export function getEnvNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Read a boolean environment variable. Truthy strings are "true", "1", "yes"
 * (case-insensitive); everything else present is treated as false.
 *
 * @param key Name of the environment variable to read.
 * @param fallback Value returned when the variable is unset or empty.
 * @returns The parsed boolean, or `fallback` when absent/empty.
 */
export function getEnvBoolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key]?.toLowerCase();
  if (raw === undefined || raw === '') return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

/** The currently selected deployment target, resolved from TEST_ENV (defaults to QA). */
export const ACTIVE_ENV: AppEnvironment =
  (getEnvOptional('TEST_ENV', 'qa') as AppEnvironment) ?? AppEnvironment.QA;
