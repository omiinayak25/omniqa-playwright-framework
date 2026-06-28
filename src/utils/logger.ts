/**
 * --------------------------------------------------------
 * File: logger.ts
 * Module: Utilities
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Centralized Winston logger — the single logging entry point for the
 * whole framework (browser actions, API requests/responses, DB queries,
 * timings, errors).
 *
 * Responsibilities:
 * - Provide a shared `logger` instance configured from validated config.
 * - Write colorized single-line output to the console and structured JSON
 *   logs to `logs/` (execution.log, error.log) for CI artifacts.
 * - Inject the async correlation id / test name into every line.
 * - Append formatted lines to the per-test capture buffer while capturing.
 * - Offer `scopedLogger()` to tag lines with a scope for CI filtering.
 *
 * Used By:
 * The entire framework — ApiClient, fixtures, page objects, DB helpers,
 * retry.util, allure-meta, and tests.
 *
 * Dependencies:
 * winston, winston-transport, node:fs, node:path, @config/config,
 * @utils/log-context, @utils/log-capture
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: one configured logger avoids scattered console.log and gives CI a
 * structured, correlation-tagged trace. WHEN: import `logger` anywhere you
 * need to log; use `scopedLogger(scope)` to label a service/test.
 * LIMITATIONS: log level is env-driven via config (no hardcoding); the
 * CaptureTransport is a no-op outside a capturing test.
 *
 * Example:
 *   import { logger } from '@utils/logger';
 *   logger.info('Logged in', { user: 'standard_user' });
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createLogger, format, transports, type Logger } from 'winston';
import Transport from 'winston-transport';
import { config } from '@config/config';
import { getLogContext, currentCorrelationId } from '@utils/log-context';
import { appendCapture, isCapturing } from '@utils/log-capture';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, splat, json } = format;

/** Winston format that injects the async correlation context into every line. */
const injectContext = format((info) => {
  const ctx = getLogContext();
  if (ctx !== undefined) {
    info['correlationId'] = ctx.correlationId;
    if (ctx.testName !== undefined) info['testName'] = ctx.testName;
  }
  return info;
});

/** Human-readable single-line format for the console. */
const consoleFormat = printf((info) => {
  const { level, message, timestamp: ts, ...meta } = info;
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${String(ts)} [${level}] ${String(message)}${metaStr}`;
});

/**
 * Custom transport that appends formatted lines to the per-test capture buffer
 * (keyed by the active correlation id). No-op outside a capturing test.
 */
class CaptureTransport extends Transport {
  public override log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));
    const id = currentCorrelationId();
    if (id !== undefined && isCapturing(id)) {
      const ts = String(info['timestamp'] ?? '');
      const level = String(info['level'] ?? '');
      const message = String(info['message'] ?? '');
      const scope = info['scope'] !== undefined ? ` (${String(info['scope'])})` : '';
      appendCapture(id, `${ts} [${level}]${scope} ${message}`);
    }
    callback();
  }
}

/**
 * The shared logger instance.
 * Level comes from validated config (env-driven, no hardcoding).
 */
export const logger: Logger = createLogger({
  level: config.execution.logLevel,
  format: combine(
    errors({ stack: true }), // capture Error stack traces
    splat(), // printf-style interpolation
    injectContext(), // add correlationId / testName from async context
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  ),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'execution.log'),
      format: combine(json()),
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: combine(json()),
    }),
    new CaptureTransport(),
  ],
  exitOnError: false,
});

/**
 * Create a child logger that tags every line with a scope (e.g. a test name
 * or service name) for easy filtering in CI logs.
 *
 * @param scope - Label attached to each line emitted by the child logger.
 * @returns A Winston `Logger` child that adds `{ scope }` to all metadata.
 */
export function scopedLogger(scope: string): Logger {
  return logger.child({ scope });
}
