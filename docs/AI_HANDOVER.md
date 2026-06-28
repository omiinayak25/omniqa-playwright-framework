# OmniQA — AI Handover (Continue From Zero Context)

> **OmniQA · Enterprise Playwright Automation Framework**
> Read this first if you are an AI/engineer continuing the project. Last synchronized: 2026-06-28.

---

## 1. Current Status

**All 24 build phases are complete.** The framework runs UI, API, DB, E2E, BDD, Accessibility, Visual,
Performance, and Network suites, with CI/CD for GitHub Actions, Jenkins, and Azure DevOps plus Docker.
`npm run verify` (typecheck + lint + format:check), `deps:check`, and `audit:security` are green.

There are **no git commits yet** — the working tree is the source of truth.

## 2. Completed Phases

| Phase | Area                        | Evidence                                                                                                       |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1–15  | Core (UI/API/DB/E2E/BDD)    | `src/{pages,components,api,services,database,repositories,fixtures}`                                           |
| 16    | Accessibility               | `src/accessibility`, `tests/accessibility` (18 tests)                                                          |
| 17    | Visual Regression           | `src/visual`, `tests/visual` (+ baselines)                                                                     |
| 18    | Performance                 | `src/performance`, `tests/performance`                                                                         |
| 19    | Docker                      | `Dockerfile`, `docker-compose.yml`, `scripts/db/apply-schema.ts`                                               |
| 20    | GitHub Actions              | `.github/workflows/ci.yml`                                                                                     |
| 21    | Jenkins                     | `Jenkinsfile`                                                                                                  |
| 22    | Azure DevOps                | `azure-pipelines.yml`, `azure/templates/*`                                                                     |
| 23    | Tooling Hardening           | `.eslintrc.cjs`, `.prettierrc.json`, `.husky/*`, `commitlint.config.cjs`, `.c8rc.json`                         |
| 24    | Optimization + enhancements | `src/network`, `src/secrets`, `flaky-reporter`, `codeql.yml`, `security.yml`, `docs/FRAMEWORK_OPTIMIZATION.md` |

## 3. Remaining Work (not blockers)

- Distributed execution (sharding) + browser-grid execution — **documented, not wired**.
- Extract `@utils/report.util` + `HtmlDashboard` base (remove a11y/perf duplication).
- Remove the incorrect `flaky` field from `summary-reporter`.
- Log rotation; generic `BaseRepository<T, Id>`; populate or remove empty scaffold dirs.
- First git commit + tags; push to the remote.

## 4. Architecture (must-know)

- **No assertions in `src/`.** Specs in `tests/` + `step-definitions/` assert.
- **DI fixture chain:** `base → page → api → db → a11y → visual → perf → net`. Always import `{ test, expect } from '@fixtures/index'`.
- **Config:** `.env` → `src/config/env.ts` → `src/config/config.ts` (Singleton + Facade, fail-fast). Add new config as a typed branch on `FrameworkConfig`.

## 5. Naming Rules

`*.page.ts`, `*.component.ts`, `*.api.ts`, `*.repository.ts`, `*.flow.ts`, `*.fixtures.ts`, `*.spec.ts`,
`*.constants.ts`, `*.model.ts`, `*.types.ts`. Classes `PascalCase`; functions/vars `camelCase`; constants `UPPER_SNAKE`.

## 6. Coding Standards

- Strict TypeScript, never `any` (prefer `unknown`); honour `noUncheckedIndexedAccess`.
- Web-first waits only (no fixed sleeps); no hardcoded values.
- Each `src/` file opens with the standard doc-block header (`File/Module/Purpose/Responsibilities/Used By/Dependencies/Notes`).
- Conventional Commits (commitlint enforces); `npm run verify` must pass before commit.

## 7. Folder Responsibilities

See [PROJECT_METADATA.md](PROJECT_METADATA.md) §3. Key: `fixtures` is the composition root; `config` is the dependency sink; `scripts/db` is shared by local/CI/Docker.

## 8. How to Continue (add a feature module)

1. Create `src/<module>/` (types + manager/service + `index.ts` barrel) with header doc-blocks.
2. Add a `@<module>/*` path alias in `tsconfig.json`.
3. Add a fixture layer `src/fixtures/<module>.fixtures.ts` extending the current tail; update `@fixtures/index`.
4. Add specs under `tests/<module>/`; add a Playwright `project` if it needs isolation.
5. Add an `npm` script and env vars (with `.env.example` + config validation) as needed.
6. Run `npm run verify`; validate live; update docs.

## 9. Important Decisions

- Fixtures for DI (Open/Closed). Lighthouse via CLI (ESM/CJS interop). One `db:schema` path for all CI.
  Framework-owned result shapes (a11y/perf/network). See [PROJECT_METADATA.md](PROJECT_METADATA.md) §19.

## 10. Known Issues

See [PROJECT_METADATA.md](PROJECT_METADATA.md) §16 and [FRAMEWORK_OPTIMIZATION.md](FRAMEWORK_OPTIMIZATION.md) (15 findings).

## 11. Future Work

See [../ROADMAP.md](../ROADMAP.md).
