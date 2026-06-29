# OminQA — Project Metadata (Single Source of Truth)

> **OminQA · Enterprise Playwright Automation Framework**
> Generated from a full repository audit; authoritative. Every figure was measured from the codebase.
> Last synchronized: 2026-06-28.

---

## 1. Project Identity

| Field         | Value                                                          |
| ------------- | -------------------------------------------------------------- |
| Product name  | **OminQA**                                                     |
| Subtitle      | Enterprise Playwright Automation Framework                     |
| Package name  | `ominqa-playwright-framework`                                  |
| Version       | `1.0.0`                                                        |
| License       | MIT                                                            |
| Author        | QA Automation Architecture Team (maintainer: `shubhangi-ttpl`) |
| Repository    | https://github.com/omiinayak25/omniqa-playwright-framework     |
| Runtime       | Node.js ≥ 20 (`.nvmrc` pins 22.x), npm ≥ 10                    |
| Module system | CommonJS                                                       |
| Status        | All 24 build phases complete                                   |

---

## 2. Architecture

- **Style:** layered + dependency injection via Playwright fixtures.
- **Golden rule:** `src/` contains **no assertions**; specs in `tests/` and `step-definitions/` assert.
- **Config:** Singleton + Facade, env-driven, fail-fast validation.
- **Fixture composition chain (Open/Closed):**
  `base → page → api → db → a11y → visual → perf → net`, each `.extend()`-ing the previous; public surface is `@fixtures/index`.

---

## 3. Folder Structure (`src/`)

| Module              | Files | Responsibility                                                           |
| ------------------- | ----- | ------------------------------------------------------------------------ |
| `accessibility/`    | 6     | axe scanner, keyboard navigator, assertions, reporter, types             |
| `api/`              | 3     | ApiClient, response-validator, schema-validator                          |
| `api/endpoints/`    | 6     | domain endpoint modules (booking/user/product/post/pet) + barrel         |
| `builders/`         | 6     | fluent Builder pattern: base + booking/employee/checkout/product + index |
| `factories/`        | 7     | Factory pattern: bulk/positive/negative/edge datasets composing builders |
| `components/`       | 4     | base + saucedemo/orangehrm UI components                                 |
| `config/`           | 2     | env accessor + validated config facade                                   |
| `constants/`        | 5     | http, ui-routes, timeouts, paths, index (endpoints → api/endpoints)      |
| `cucumber/`         | 2     | World + hooks                                                            |
| `custom-reporters/` | 2     | summary-reporter, flaky-reporter                                         |
| `database/`         | 4     | pool, query-runner, db-assertions, availability                          |
| `fixtures/`         | 8     | DI chain layers + types + index                                          |
| `helpers/`          | 4     | orchestration: environment, browser launch, storage-state reuse          |
| `flows/`            | 1     | checkout business flow                                                   |
| `hooks/`            | 2     | global-setup, global-teardown                                            |
| `middlewares/`      | 5     | composable API pipeline: correlation-id, timing, network-capture + core  |
| `models/`           | 12    | domain + config models                                                   |
| `network/`          | 3     | NetworkManager, types, index                                             |
| `pages/`            | 10    | base + saucedemo (6) + orangehrm (3)                                     |
| `performance/`      | 5     | collector, assertions, reporter, lighthouse-runner, types                |
| `repositories/`     | 4     | base + employee/department/product-record                                |
| `schemas/`          | 2     | AJV booking schema + index                                               |
| `secrets/`          | 2     | secret-provider, index                                                   |
| `services/`         | 6     | auth, booking, pet, post, product, user                                  |
| `types/`            | 3     | shared types: Maybe/DeepReadonly/Result, ExecutionContext + re-exports   |
| `utils/`            | 12    | logger, crypto, retry, wait, date, random, file, allure, log-*           |

---

## 4. Path Aliases (`tsconfig.json`)

`@pages` · `@flows` · `@accessibility` · `@visual` · `@performance` · `@network` · `@secrets` · `@components` ·
`@api` · `@services` · `@database` · `@repositories` · `@fixtures` · `@factories` · `@builders` · `@utils` ·
`@helpers` · `@config` · `@constants` · `@models` · `@apptypes` · `@schemas` · `@hooks` · `@bdd` · `@middlewares`

---

## 5. Dependencies

**Production (7):** `ajv`, `ajv-formats`, `allure-js-commons`, `dotenv`, `pg`, `winston`, `winston-transport`

**Development (30):** `@playwright/test`, `@axe-core/playwright`, `axe-core`, `@cucumber/cucumber`,
`@faker-js/faker`, `allure-playwright`, `allure-commandline`, `lighthouse`, `chrome-launcher`, `exceljs`,
`csv-parse`, `cross-env`, `ts-node`, `tsconfig-paths`, `typescript`, `@types/node`, `@types/pg`,
`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, `eslint-config-prettier`,
`eslint-plugin-playwright`, `prettier`, `husky`, `lint-staged`, `@commitlint/cli`,
`@commitlint/config-conventional`, `c8`, `depcheck`, `rimraf`.

---

## 6. Configurations

| File                                                  | Purpose                                              |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `playwright.config.ts`                                | 12 projects, 6 reporters, expect/screenshot defaults |
| `tsconfig.json`                                       | strict TS, 25 path aliases                           |
| `cucumber.js`                                         | Cucumber runner + ts-node/tsconfig-paths             |
| `.env.example`                                        | 44 documented environment variables                  |
| `.eslintrc.cjs`                                       | TS + Prettier + Playwright lint                      |
| `.prettierrc.json` / ignore                           | formatting                                           |
| `commitlint.config.cjs`                               | Conventional Commits                                 |
| `.c8rc.json`                                          | coverage (lcov + html)                               |
| `.depcheckrc.json`                                    | dependency hygiene                                   |
| `sonar-project.properties`                            | SonarQube/Cloud quality gate                         |
| `Dockerfile` / `docker-compose.yml` / `.dockerignore` | containerised runner + Postgres                      |

---

## 7. API Services (`src/services`)

`auth.api.ts`, `booking.api.ts`, `pet.api.ts`, `post.api.ts`, `product.api.ts`, `user.api.ts` — all built on the typed `ApiClient` (`src/api/clients/api-client.ts`) with logging, retry, and AJV validation.

## 8. Page Objects (`src/pages`)

`base.page.ts` + SauceDemo (`login`, `inventory`, `cart`, `checkout-info`, `checkout-overview`, `checkout-complete`) + OrangeHRM (`login`, `dashboard`, `pim`). Components: `base.component`, saucedemo `header`, orangehrm `data-table` + `pagination`.

## 9. Database & Repositories

- **Database (`src/database`):** `db-pool` (Singleton `pg` Pool), `query-runner`, `db-assertions`, `db-availability`.
- **Repositories (`src/repositories`):** `base.repository` + `employee`, `department`, `product-record`.
- **Schema (`scripts/db/schema.sql`):** `departments`, `employees` (FK + CHECK), `products` sync table, `active_employees` view, indexes, `give_raise()` stored function, seed data.
- **Seeding:** `scripts/db/provision.sh` (local, sudo) and `scripts/db/apply-schema.ts` (`npm run db:schema`, used by CI + Docker).

## 10. Fixtures (DI chain)

| Layer             | Injects                                               |
| ----------------- | ----------------------------------------------------- |
| `base.fixtures`   | `appConfig`, `workerLogger`, `log`, `data`, `autoLog` |
| `page.fixtures`   | SauceDemo + OrangeHRM page objects, `checkoutFlow`    |
| `api.fixtures`    | 6 API service classes                                 |
| `db.fixtures`     | `db`, `dbAssert`, repositories                        |
| `a11y.fixtures`   | `a11yScanner`, `keyboard`, `a11yReporter`, `a11y`     |
| `visual.fixtures` | `visual` (VisualComparator)                           |
| `perf.fixtures`   | `perf`, `perfAssert`, `perfReporter`, `lighthouse`    |
| `net.fixtures`    | `network` (NetworkManager, auto-disposed)             |

---

## 11. Execution Flow

1. `globalSetup` — ensure output dirs, write Allure metadata, print run banner.
2. `setup` project — log in, persist storage state to `.auth/`.
3. Project tests run (fixtures lazily built per test); web-first waits; correlation-ID logging.
4. Reporters emit list/html/junit/allure/summary/flaky + a11y/perf dashboards.
5. `globalTeardown` — close DB pool.

## 12. Reporting & Logging

- **Reporters (6):** `list`, `html`, `junit` (`reports/junit/results.xml`), `allure-playwright` (`reports/allure-results`), `summary-reporter` (`reports/summary.json`), `flaky-reporter` (`reports/flaky.json`).
- **Dashboards:** `reports/accessibility/index.html`, `reports/performance/index.html`.
- **Logging:** Winston (console + `logs/execution.log` + `logs/error.log`), correlation IDs, failure log capture/attachment.

## 13. Test Strategy & Patterns

- **Patterns:** Page Object Model, Component Object Model, Repository, Singleton (config, pool), Facade (config), Factory/Builder-style data, Dependency Injection (fixtures), Strategy (SecretProvider), Custom Reporter.
- **Naming:** `*.page.ts`, `*.component.ts`, `*.api.ts`, `*.repository.ts`, `*.flow.ts`, `*.fixtures.ts`, `*.spec.ts`, `*.constants.ts`, `*.model.ts`. Classes `PascalCase`, functions/vars `camelCase`, constants `UPPER_SNAKE`.

---

## 14. Implemented Features

UI (cross-browser + mobile) · API (typed services + AJV contracts + SLA) · Database (repo pattern, view, stored fn) ·
E2E (incl. API→DB reconciliation) · BDD (Cucumber) · Accessibility (axe + keyboard) · Visual regression ·
Performance smoke (+ optional Lighthouse) · Network (route mock/intercept/HAR) · Secrets vault · Reporting (6) ·
Logging · CI/CD (GitHub Actions, Jenkins, Azure, Docker) · CodeQL · OWASP Dependency-Check · SonarCloud · Coverage (c8).

## 15. Missing / Not-Yet-Implemented

- Distributed execution (sharding) & browser-grid execution — **documented, not wired**.
- `src/builders`, `factories`, `helpers`, `middlewares`, `types` — **empty scaffolding**.
- Generic `BaseRepository<TEntity, TId>` — concrete repos duplicate CRUD shape.
- Log rotation / env-gated file logging.

## 16. Known Issues & Technical Debt

| Area             | Issue                                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| Code duplication | `escapeHtml`/`slugify`/dashboard-render duplicated in a11y + perf reporters      |
| Technical debt   | `summary-reporter` `flaky` derived from `interrupted` (not true flakiness)       |
| Network capture  | `NetworkRecord.mocked` always `false` (cannot be attributed in request listener) |
| Config           | Static salt in `crypto.util` (fine for test data, not production secrets)        |
| Folder structure | 5 empty reserved dirs imply unbuilt capability                                   |
| Versioning       | No git commits/tags yet                                                          |

See [FRAMEWORK_OPTIMIZATION.md](FRAMEWORK_OPTIMIZATION.md) for the full 15-finding adversarial review.

## 17. Performance & Security

- **Performance:** parallel workers, per-project isolation, env-driven budgets, c8 coverage → Sonar.
- **Security:** `.env` git-ignored + excluded from image; `maskSecret()`; AES-256-GCM vault; parameterised SQL; CodeQL + OWASP + npm audit in CI. See [SECURITY.md](../SECURITY.md).

## 18. Roadmap / Future Phases

See [ROADMAP.md](../ROADMAP.md). Next: shared report util, fix/remove summary flaky field, CI sharding, log rotation, generic `BaseRepository`, Docker-pinned visual baselines, browser-grid wiring.

## 19. Decision Log

| Decision                                          | Rationale                                                       |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Fixtures as the DI mechanism                      | Native to Playwright; Open/Closed growth without touching specs |
| No assertions in `src/`                           | Clear separation; reusable POM/services across UI/BDD           |
| Lighthouse via CLI (not import)                   | Lighthouse is ESM, framework is CJS — spawning avoids interop   |
| One `db:schema` path for all CI                   | Behaviour parity across GitHub Actions, Jenkins, Azure          |
| Framework-owned result shapes (a11y/perf/network) | Reports stay stable across vendor upgrades                      |

## 20. Statistics

| Metric                 | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Source TS files        | 103                                                                  |
| Test TS files          | 39 (37 specs + 2 step-defs)                                          |
| Total TS LOC           | ~12,500 (src ~9,700 · tests ~2,612)                                  |
| Markdown files         | 35                                                                   |
| Test cases             | 137 (api 56, a11y 18, db 18, ui 15, e2e 13, perf 6, visual 6, net 5) |
| `test.describe` blocks | 48                                                                   |
| Cucumber scenarios     | 6 (2 feature files, 15 step definitions)                             |
| Playwright projects    | 12                                                                   |
| Page objects           | 10 (incl. base)                                                      |
| Components             | 4 (incl. base)                                                       |
| API services           | 6                                                                    |
| Repositories           | 4 (incl. base)                                                       |
| Fixtures               | 8 layers                                                             |
| Utilities              | 12                                                                   |
| Models                 | 12                                                                   |
| Custom reporters       | 2                                                                    |
| Reporters total        | 6                                                                    |
| Production deps        | 7                                                                    |
| Dev deps               | 30                                                                   |
| npm scripts            | 39                                                                   |
| Env variables          | 44                                                                   |
| Path aliases           | 25                                                                   |
| Visual baselines       | 6                                                                    |
| Browsers / devices     | Chromium, Firefox, WebKit, Pixel 7                                   |
| CI systems             | GitHub Actions, Jenkins, Azure DevOps (+ Docker)                     |
| Supported apps         | 2 UI, 5 API, 1 DB schema                                             |
