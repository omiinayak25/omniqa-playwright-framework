# Roadmap — OminQA

> **OminQA · Enterprise Playwright Automation Framework**
> Last synchronized: 2026-06-28. Mirrors the actual repository state.

---

## ✅ Completed (all 24 build phases)

| Area                         | Status | Notes                                                                  |
| ---------------------------- | ------ | ---------------------------------------------------------------------- |
| Core framework (Phases 1–15) | ✅     | UI, API, DB, E2E, BDD; POM, components, repositories, fixtures, config |
| Accessibility (16)           | ✅     | axe scanner, keyboard navigator, assertions, dashboard                 |
| Visual regression (17)       | ✅     | `VisualComparator`, masking, committed baselines                       |
| Performance (18)             | ✅     | timing budgets, optional Lighthouse                                    |
| Docker (19)                  | ✅     | runner image + Postgres + `db:schema`                                  |
| GitHub Actions (20)          | ✅     | matrix CI, Postgres service, Allure                                    |
| Jenkins (21)                 | ✅     | declarative pipeline + Postgres sidecar                                |
| Azure DevOps (22)            | ✅     | stages + templates + service container                                 |
| Tooling hardening (23)       | ✅     | ESLint, Prettier, Husky, commitlint, c8, depcheck                      |
| Optimization (24)            | ✅     | `@network`, `@secrets`, flaky reporter, CodeQL, OWASP, Sonar           |

## 🚧 In Progress

_Nothing actively in progress — the build is complete. The items below are planned improvements._

## 📋 Planned (prioritised)

1. **Shared report util** — extract `@utils/report.util` (`escapeHtml`, `slugify`) + `HtmlDashboard` base; refactor a11y + perf reporters (removes duplication and O(n²) dashboard re-renders).
2. **Fix `summary-reporter` flaky field** — remove the `interrupted`-based field; rely on the authoritative `flaky-reporter`.
3. **CI sharding** — `--shard=i/n` matrix + `blob` reporter + `merge-reports` for horizontal scale.
4. **Docker-pinned visual baselines** — generate baselines in the Phase 19 image to avoid cross-renderer drift.
5. **Log rotation** — `winston-daily-rotate-file`; env-gate file transports.
6. **Generic `BaseRepository<TEntity, TId>`** — de-duplicate concrete repository CRUD.
7. **Prune/populate scaffold dirs** — `builders/factories/helpers/middlewares/types`.
8. **First git release** — initial commit, `v1.0.0` tag, push to remote, enable branch protection + required checks.

## 💡 Future Ideas

- Browser-grid execution (Selenium Grid / Moon / Playwright service) via env-gated `connectOptions`.
- Test-analytics dashboard aggregating `summary.json` + `flaky.json` + Allure history over time.
- Flaky-test quarantine automation (auto-tag + track) built on `flaky.json`.
- Contract testing against OpenAPI specs; mutation testing for the framework utilities.
- Secret-vault adapters for HashiCorp Vault / Azure Key Vault / AWS Secrets Manager.
- Visual review workflow with auto-PR baseline updates.

---

See also: [CHANGELOG.md](CHANGELOG.md) · [docs/FRAMEWORK_OPTIMIZATION.md](docs/FRAMEWORK_OPTIMIZATION.md) · [docs/PROJECT_METADATA.md](docs/PROJECT_METADATA.md).
