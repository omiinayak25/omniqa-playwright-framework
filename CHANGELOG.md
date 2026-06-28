# Changelog

All notable changes to **OmniQA — Enterprise Playwright Automation Framework** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** the repository currently has no git tags/releases. `1.0.0` reflects the state of the
> codebase after all 24 build phases. Entries are grouped by the phase that introduced them.

---

## [1.0.0] — 2026-06-28

The complete enterprise framework: 9 test layers, 12 Playwright projects, full CI/CD, and quality gates.

### Added — Core (Phases 1–15)

- Enterprise folder structure, strict TypeScript, 25 path aliases.
- Validated, env-driven configuration (Singleton + Facade), fail-fast.
- Advanced Page Object Model + Component Object Model + business-flow layer (SauceDemo, OrangeHRM).
- API framework: typed `ApiClient`, 6 service classes, retry/backoff, AJV schema/contract validation, SLA checks.
- PostgreSQL layer: Singleton `pg` pool, `QueryRunner`, `DbAssertions`, availability probe.
- **Repository pattern** (base + employee/department/product-record) with schema, view, and stored function.
- Dependency injection via Playwright fixtures (`base → page → api → db`).
- Test layers: UI (cross-browser + mobile), API, Database, End-to-End (incl. API→DB reconciliation).
- BDD with Cucumber (features + step definitions) reusing page objects & services.
- Reporting (list/HTML/JUnit/Allure + custom summary reporter) and Winston logging with correlation IDs.
- Utilities: crypto (AES-256-GCM), retry, wait, date, random (Faker), file (JSON/CSV/Excel), Allure.

### Added — Accessibility (Phase 16)

- `@accessibility` module: axe scanner, keyboard navigator, WCAG assertions, HTML reporter + dashboard.
- `a11y.fixtures`; 18 accessibility tests (SauceDemo + OrangeHRM); `npm run test:a11y`.

### Added — Visual Regression (Phase 17)

- `@visual` module: `VisualComparator`, freeze stylesheet, dynamic-element masking, env-driven tolerance.
- `visual.fixtures`; committed per-project/platform baselines; `expect.toHaveScreenshot` defaults; `npm run test:visual`.

### Added — Performance (Phase 18)

- `@performance` module: Navigation/Paint/LCP/Resource collector, budget assertions, reporter + dashboard, Lighthouse runner.
- `perf.fixtures`; env-driven budgets (`PERF_*`, `LIGHTHOUSE_*`); `npm run test:perf`.

### Added — Docker (Phase 19)

- `Dockerfile` (Playwright base image), `docker-compose.yml` (runner + Postgres), `.dockerignore`.
- `scripts/db/apply-schema.ts` + `npm run db:schema` for container/CI DB seeding.

### Added — CI/CD (Phases 20–22)

- **GitHub Actions** `ci.yml`: quality gate → 9-project matrix (Postgres service) → Allure → notify.
- **Jenkins** `Jenkinsfile`: declarative pipeline, Docker image + Postgres sidecar, email notifications.
- **Azure DevOps** `azure-pipelines.yml` + `azure/templates/*`: stages, templated jobs, service container, Allure.

### Added — Tooling Hardening (Phase 23)

- ESLint (`.eslintrc.cjs`), Prettier, Husky hooks (pre-commit/commit-msg/pre-push), lint-staged, commitlint.
- Code coverage (`c8` + `.c8rc.json`), dependency checks (`depcheck`), `npm run audit:security`, `npm run verify`.
- Promoted `allure-js-commons` and `winston-transport` to direct dependencies (found by depcheck).

### Added — Optimization & Enterprise Enhancements (Phase 24)

- `@network` module: route mocking, interception, response rewriting, traffic capture, HAR record/replay (+ `net.fixtures`, 5 tests).
- `@secrets` module: pluggable `SecretProvider` (env + AES-256-GCM encrypted vault).
- `flaky-reporter` (`reports/flaky.json`) using Playwright's `flaky` outcome.
- Security CI: `codeql.yml`, `security.yml` (OWASP Dependency-Check + SonarCloud), `sonar-project.properties`.
- `docs/FRAMEWORK_OPTIMIZATION.md` — senior architecture review (15 findings).

### Known Issues

- `summary-reporter` `flaky` field uses `interrupted` status (use `flaky-reporter` instead).
- `escapeHtml`/`slugify` duplicated across a11y + performance reporters.
- `src/builders|factories|helpers|middlewares|types` are empty scaffolding.
- Distributed/grid execution documented but not wired into config.

[1.0.0]: https://github.com/omiinayak25/omniqa-playwright-framework/releases/tag/v1.0.0
