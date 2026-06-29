# Configuration — OMINQA Playwright Framework

- **Purpose** — Single source of typed, validated, immutable framework configuration resolved from environment variables (UI/API URLs, credentials, DB settings, execution options).

## Files

| File        | Responsibility                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.ts`    | Loads `.env` once and exposes typed accessors (`getEnv`/`getEnvOptional`/`getEnvNumber`/`getEnvBoolean`), `AppEnvironment`, and `ACTIVE_ENV`. |
| `config.ts` | `ConfigManager` (Singleton + Facade) — assembles and fail-fast validates the `FrameworkConfig` tree and exports the immutable `config`.       |

## Responsibilities

- Centralize all `process.env` reads behind typed accessors (no scattered `process.env`).
- Build the `ui`/`api`/`database`/`execution` config tree and validate environment, URLs, and DB port at load time.
- Expose one cached, immutable `config` shared framework-wide.

## Dependencies

- `dotenv`, `node:path`
- `@models/config.model` (config interface shapes)

## Interacts With

- Consumed by `playwright.config.ts`, `@services/*`, `@repositories/*`, `@pages/*`, `@database/*`, fixtures, and tests.

## Usage Example

```ts
import { config } from '@config/config';

const baseUrl = config.ui.sauceDemo.baseUrl;
const workers = config.execution.workers;
```
