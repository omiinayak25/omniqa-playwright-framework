# Configuration Reference — OminQA (Enterprise Playwright Automation Framework)

> Every configuration option explained: purpose, possible values, recommended value, when to modify,
> and impact. Grounded in the actual config files.
>
> ⚠️ **Sync note (2026-06-28):** All 24 build phases are complete. CI/CD (GitHub Actions, Jenkins,
> Azure DevOps) and Docker now **exist**; any `❌ NOT PRESENT` markers below are historical and should be
> read as **present**. The authoritative references are [README.md](../README.md) and
> [PROJECT_METADATA.md](PROJECT_METADATA.md). Visual (`VISUAL_*`), performance (`PERF_*`, `LIGHTHOUSE_*`),
> and secrets (`SECRETS_VAULT_FILE`) env vars are also configurable — see [`.env.example`](../.env.example).

---

## 1. `playwright.config.ts`

| Option                           | Purpose                   | Possible values                                 | Recommended                                         | When to modify                                   | Impact                              |
| -------------------------------- | ------------------------- | ----------------------------------------------- | --------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| `testDir`                        | Root of specs             | path                                            | `./tests`                                           | New top-level test root                          | Discovery scope                     |
| `globalSetup` / `globalTeardown` | Run-once hooks            | path                                            | `src/hooks/*`                                       | Add run-wide setup (dirs, Allure meta, DB close) | Runs before/after all tests         |
| `timeout`                        | Per-test timeout (ms)     | number                                          | `30000` (env `DEFAULT_TIMEOUT_MS`)                  | Slow apps (OrangeHRM)                            | Test fails if exceeded              |
| `expect.timeout`                 | Assertion timeout         | number                                          | `10000` (env `EXPECT_TIMEOUT_MS`)                   | Slow assertions                                  | `expect` retry budget               |
| `fullyParallel`                  | Parallelize within files  | bool                                            | `true`                                              | Serialize a file → `test.describe.serial`        | Speed vs isolation                  |
| `forbidOnly`                     | Fail on stray `test.only` | bool                                            | `true` in CI (`CI` env)                             | —                                                | CI guard                            |
| `retries`                        | Auto-retry failed tests   | number                                          | `1` in CI, `0` local (`RETRIES`)                    | Flaky external deps                              | Masks/handles flake                 |
| `workers`                        | Parallel worker processes | number                                          | `4` in CI (`WORKERS`)                               | CPU/memory limits                                | Throughput                          |
| `outputDir`                      | Per-test artifacts        | path                                            | `./test-results`                                    | —                                                | Trace/screenshot/video location     |
| `reporter`                       | Reporters array           | list                                            | list+html+junit+allure+custom                       | Add/remove reporters                             | **CLI `--reporter` OVERRIDES this** |
| `use.headless`                   | Headless browser          | bool                                            | `true` (`HEADLESS`)                                 | Debugging → `false`                              | Visible browser                     |
| `use.actionTimeout`              | Per-action timeout        | number                                          | `15000`                                             | Slow widgets                                     | Action wait budget                  |
| `use.navigationTimeout`          | Navigation timeout        | number                                          | `30000`                                             | Slow page loads                                  | `goto` budget                       |
| `use.trace`                      | Trace capture             | `on`/`off`/`on-first-retry`/`retain-on-failure` | `on-first-retry`                                    | Deep debugging → `on`                            | Disk + perf                         |
| `use.screenshot`                 | Screenshot policy         | `off`/`on`/`only-on-failure`                    | `only-on-failure`                                   | —                                                | Failure evidence                    |
| `use.video`                      | Video policy              | `off`/`on`/`retain-on-failure`                  | `retain-on-failure`                                 | —                                                | Disk + perf                         |
| `use.ignoreHTTPSErrors`          | Ignore TLS errors         | bool                                            | `true`                                              | Strict TLS testing → `false`                     | Cert handling                       |
| `projects[]`                     | Execution segments        | list                                            | setup, ui-*, api, db, e2e, a11y/visual/perf (empty) | Add a test type/browser                          | `--project=<name>` selection        |
| `projects[].dependencies`        | Pre-run projects          | list                                            | UI/e2e depend on `setup`                            | New auth setup                                   | Storage-state ordering              |

**Projects:** `setup` (auth → storageState) · `ui-chromium/firefox/webkit/mobile` · `api` (no browser) ·
`db` · `e2e` · `accessibility`/`visual`/`performance` (defined, **no specs yet**).

---

## 2. `tsconfig.json`

| Option                                             | Purpose                            | Recommended                    | Impact                                                              |
| -------------------------------------------------- | ---------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `target` / `module` / `moduleResolution`           | JS output + module system          | `ES2022` / `CommonJS` / `Node` | Compatibility with Playwright/ts-node                               |
| `strict`                                           | Master strictness                  | `true`                         | Enables 8 strict sub-flags                                          |
| `noUncheckedIndexedAccess`                         | `arr[i]` → `T \| undefined`        | `true`                         | Forces handling missing data (most valuable extra flag)             |
| `noPropertyAccessFromIndexSignature`               | Bracket access on index sigs       | `true`                         | Caught Winston `info[...]` access                                   |
| `useUnknownInCatchVariables`                       | `catch(e: unknown)`                | `true`                         | Enforces "prefer unknown"                                           |
| `noUnusedLocals` / `noUnusedParameters`            | Dead-code detection                | `true`                         | Cleaner code                                                        |
| `noImplicitReturns` / `noFallthroughCasesInSwitch` | Control-flow safety                | `true`                         | Bug prevention                                                      |
| `esModuleInterop` / `resolveJsonModule`            | Import interop + JSON              | `true`                         | Import flexibility                                                  |
| `skipLibCheck`                                     | Skip `node_modules` type-check     | `true`                         | Faster builds (trade-off: deps not type-checked)                    |
| `sourceMap`                                        | Source maps                        | `true`                         | Better stack traces                                                 |
| `baseUrl` + `paths`                                | **Path aliases** (20 incl. `@bdd`) | as defined                     | `@pages`, `@services`… (compile-time; runtime via `tsconfig-paths`) |
| `ts-node.require`                                  | Runtime alias loader               | `tsconfig-paths/register`      | **Critical for Cucumber** alias resolution                          |
| `ts-node.transpileOnly`                            | Skip type-check at runtime         | `true`                         | Fast Cucumber runs                                                  |

**When to modify:** add a `paths` entry when introducing a new top-level `src/` folder (and mirror it
for Cucumber via the already-wired `ts-node.require`).

---

## 3. `package.json`

| Field             | Purpose                 | Notes                                                                                                                           |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Package id              | `ominqa-playwright-framework`                                                                                                   |
| `description`     | One-line description    | "Enterprise Test Automation Framework built with Playwright and TypeScript."                                                    |
| `engines`         | Node/npm floors         | Node ≥20, npm ≥10                                                                                                               |
| `scripts`         | 30+ grouped scripts     | test execution, env-targeted, BDD, reporting, quality, housekeeping                                                             |
| `lint-staged`     | Pre-commit file actions | ⚠️ requires Husky hook + ESLint/Prettier configs (**not present yet**)                                                          |
| `dependencies`    | Runtime                 | dotenv, pg, winston, ajv(+formats)                                                                                              |
| `devDependencies` | Tooling                 | Playwright, Cucumber, Faker, Allure, csv-parse, exceljs, ts-node, tsconfig-paths, typescript, eslint/prettier/husky/lint-staged |

**Key scripts:** `test`, `test:ui/api/db/e2e/bdd`, `test:smoke/regression`, `test:headed/debug/parallel`,
`test:dev/qa/uat/staging`, `report:html/allure`, `typecheck`, `install:browsers`, `clean`.
⚠️ `lint`/`format` are **non-functional** until ESLint/Prettier config files exist.

---

## 4. `.env.example` (template for `.env`)

| Variable                                     | Purpose              | Possible values               | Recommended    | Impact                        |
| -------------------------------------------- | -------------------- | ----------------------------- | -------------- | ----------------------------- |
| `TEST_ENV`                                   | Active environment   | dev/qa/uat/staging/production | `qa`           | Config selection              |
| `*_URL` (7)                                  | App/API base URLs    | URL                           | demo URLs      | Targets                       |
| `REQRES_API_KEY`                             | ReqRes key           | string                        | (register one) | ReqRes tests gated without it |
| `*_USERNAME`/`*_PASSWORD`                    | Demo creds           | string                        | demo defaults  | Auth                          |
| `DB_HOST/PORT/NAME/USER/PASSWORD/SCHEMA/SSL` | PostgreSQL conn      | —                             | localhost:5432 | DB tests                      |
| `DB_POOL_MAX`                                | Max pool connections | number                        | `10`           | Concurrency                   |
| `DB_POOL_IDLE_TIMEOUT_MS`                    | Idle connection TTL  | number                        | `30000`        | Resource use                  |
| `ENCRYPTION_SECRET`                          | scrypt passphrase    | string                        | (set in CI)    | AES key derivation            |
| `HEADLESS`                                   | Headless toggle      | true/false                    | `true`         | Browser visibility            |
| `DEFAULT_TIMEOUT_MS`/`EXPECT_TIMEOUT_MS`     | Timeouts             | number                        | 30000/10000    | Wait budgets                  |
| `RETRIES`/`WORKERS`                          | Retry/parallelism    | number                        | 1/4            | CI behavior                   |
| `LOG_LEVEL`                                  | Winston level        | error/warn/info/debug         | `info`         | Log verbosity                 |

**Security:** `.env` is git-ignored; never commit real secrets. CI should inject secrets as env vars.

---

## 5. `cucumber.js`

| Option                           | Purpose                 | Value                                                 |
| -------------------------------- | ----------------------- | ----------------------------------------------------- |
| `requireModule`                  | Runtime TS transpile    | `['ts-node/register']`                                |
| `require`                        | Load world/hooks/steps  | `['src/cucumber/**/*.ts','step-definitions/**/*.ts']` |
| `paths`                          | Feature files           | `['features/**/*.feature']`                           |
| `format`                         | Reporters               | progress-bar, summary, html, json                     |
| `formatOptions.snippetInterface` | Snippet style           | `async-await`                                         |
| `publishQuiet`                   | Suppress publish banner | `true`                                                |

**When to modify:** add new step-def globs or output formats. Path aliases resolve via the
`tsconfig.json` `ts-node.require` chain.

---

## 6. CI/CD, Docker, Pipelines — ❌ NOT PRESENT

`Dockerfile`, `docker-compose.yml`, `.github/workflows/*`, `Jenkinsfile`, `azure-pipelines.yml` do
**not exist** in the repository yet (planned Phases 19–22). When added, each option should be
documented here following the same table format (purpose / values / recommended / when to modify /
impact).

---

## 7. ESLint / Prettier / Husky — ❌ CONFIG FILES NOT PRESENT

`package.json` references these tools and `lint-staged`, but no `eslint.config.*`, `.prettierrc*`, or
`.husky/` hook files exist. `npm run lint` / `npm run format` will not work until they are added
(see [IMPROVEMENT_REPORT.md](IMPROVEMENT_REPORT.md) finding C1).
