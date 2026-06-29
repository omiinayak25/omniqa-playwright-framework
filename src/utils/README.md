# Utilities — OMINQA Playwright Framework

- **Purpose** — Cross-cutting helper modules: logging, correlation/capture, fake data, dates, files, crypto, retry/wait, and Allure metadata.

## Files

| File             | Responsibility                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `index.ts`       | Barrel re-exporting common utils (logger, date, wait, retry, random, file, crypto).                   |
| `logger.ts`      | Centralized Winston logger + `scopedLogger`; console + structured JSON logs with correlation tagging. |
| `log-context.ts` | Per-test async log context carrying a correlation id (and test name).                                 |
| `log-capture.ts` | Per-test log capture buffers keyed by correlation id.                                                 |
| `random.util.ts` | Faker-backed random test-data generators (names, email, phone, int, uuid …).                          |
| `date.util.ts`   | Date/time helpers (timestamps, filesystem-safe names, duration formatting).                           |
| `file.util.ts`   | Filesystem/data-file helpers (JSON/CSV/Excel read+write, `ensureDir`).                                |
| `crypto.util.ts` | Encryption/decryption/hashing/encoding helpers and `maskSecret`.                                      |
| `retry.util.ts`  | Generic async retry with exponential backoff for transient failures.                                  |
| `wait.util.ts`   | Non-UI waiting/polling helpers (`sleep`, poll-until).                                                 |
| `allure-meta.ts` | Generates Allure report metadata files (environment.properties, categories.json).                     |
| `allure.util.ts` | Typed wrapper over `allure-js-commons` (labels, steps, attachments).                                  |

> Note: `index.ts` does NOT re-export `log-context`, `log-capture`, `allure-meta`, or `allure.util` — import those directly.

## Responsibilities

- Provide one configured logger and correlation-aware capture for CI-friendly traces.
- Supply reusable data, date, file, crypto, retry, and wait helpers.
- Generate Allure report metadata and step/label wrappers.

## Dependencies

- `winston`, `@faker-js/faker`, `dotenv`-resolved `@config/config`, `allure-js-commons`, Node built-ins (`fs`, `path`).

## Interacts With

- Used framework-wide: `@api/*`, `@database/*`, `@pages/*`, fixtures, hooks, reporters, and tests.

## Usage Example

```ts
import { logger, retryAsync, randomEmail } from '@utils/index';

logger.info('Created user', { email: randomEmail() });
await retryAsync(() => doFlaky());
```
