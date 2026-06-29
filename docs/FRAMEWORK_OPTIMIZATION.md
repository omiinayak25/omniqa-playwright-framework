# Framework Optimization & Architecture Review (Phase 24)

> Senior QA-Automation-Architect review of the OMINQA Playwright framework.
> Adversarial by design: this lists what is _missing or weak_, not just what works.
> Severity: **Critical** (must fix) · **High** (should fix) · **Medium** (recommended) · **Low** (nice to have).

---

## 1. Architecture Review — Findings

| #   | Severity | Area               | File:Line                                                     | Issue                                                                                                                                  | Recommendation                                                                                             |
| --- | -------- | ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | High     | Code Duplication   | `accessibility-reporter.ts`, `performance-reporter.ts`        | `escapeHtml`, `slugify`, and the `regenerateIndex` (read-dir → render HTML) logic are duplicated across the two reporters.             | Extract a shared `@utils/report.util` (`escapeHtml`, `slugify`) and a `HtmlDashboard` base class.          |
| 2   | High     | Technical Debt     | `custom-reporters/summary-reporter.ts:89`                     | `flaky` is computed from `status === 'interrupted'`, which is **not** flakiness; real flaky = failed-then-passed.                      | Use `test.outcome() === 'flaky'` (now done in the new `flaky-reporter.ts`); fix or drop the summary field. |
| 3   | Medium   | Test Stability     | `network-manager.ts` (`onRequestFinished`)                    | Capture pushes records from an un-awaited async IIFE; `traffic` may be momentarily incomplete when asserted immediately.               | Expose `await network.settle()` that drains pending response reads before assertions.                      |
| 4   | Medium   | Folder Structure   | `src/{builders,factories,helpers,middlewares,types}/.gitkeep` | Five empty scaffold directories carry only `.gitkeep` — dead structure that implies capability that isn't there.                       | Either populate (e.g. move data-builders in) or remove until needed (YAGNI).                               |
| 5   | Medium   | Maintainability    | `playwright.config.ts` (projects)                             | 11 projects share near-identical `use: { ...devices['Desktop Chrome'] }`; repetition invites drift.                                    | Factor a `chromeProject(name, dir)` helper to DRY project definitions.                                     |
| 6   | Medium   | Configuration      | `crypto.util.ts:39`                                           | Static salt for key derivation (acknowledged in-file) — fine for test data, unsafe if reused for real secrets.                         | Per-secret random salt stored alongside ciphertext for the new vault path.                                 |
| 7   | Medium   | Performance        | `accessibility/performance reporters` (`regenerateIndex`)     | The dashboard is re-read + re-rendered from disk on **every** `record()` — O(n²) writes across a large run.                            | Debounce to a single render in a global-teardown hook, or append-only + render once.                       |
| 8   | Medium   | Logging            | `utils/logger.ts`                                             | Two file transports (`execution.log`, `error.log`) always write, unbounded — large local/CI runs bloat `logs/`.                        | Add `winston-daily-rotate-file` (size/date rotation) and make file logging env-gated.                      |
| 9   | Medium   | Parallel Execution | CI (P20–22)                                                   | Suites run per-project but not **sharded**; a big project is single-threaded across agents.                                            | Add `--shard=i/n` across a CI matrix (see §3 Distributed Execution).                                       |
| 10  | Low      | Fixtures           | `fixtures/*` (8-layer chain)                                  | The chain is deep; a new engineer must trace 8 files to see all fixtures. (Playwright builds only requested fixtures, so no perf hit.) | Add a one-page fixture catalog (done — see fixtures `README`); consider grouping optional layers.          |
| 11  | Low      | Repository         | `repositories/base.repository.ts`                             | Each concrete repo re-implements similar CRUD; no generic typed base.                                                                  | Add a generic `BaseRepository<TEntity, TId>` with `findById/insert/delete`.                                |
| 12  | Low      | Dependency         | `package.json`                                                | `lighthouse` + `chrome-launcher` are heavy and only used by an opt-in spec.                                                            | Keep declared but document as optional; consider `optionalDependencies`.                                   |
| 13  | Low      | Memory             | reporters hold full `raw` axe results in `A11yScanResult`     | Large pages → large in-memory `raw`; fine per-test, wasteful if accumulated.                                                           | Already stripped before persistence; ensure no global accumulation (it isn't).                             |
| 14  | Low      | Refactoring        | `network.types.ts` `NetworkRecord.mocked`                     | `mocked` is always `false` from capture (can't be attributed in the request listener).                                                 | Drop the field or attribute mocks via a routed-URL set.                                                    |
| 15  | Low      | Test Stability     | visual baselines                                              | Linux baselines committed; CI on a different renderer/font set could drift.                                                            | Pin the Phase 19 Docker image as the canonical baseline environment.                                       |

**Net:** no Critical defects; the framework is production-shaped. The two highest-value fixes are **#1 (shared report util)** and **#2 (correct flaky semantics)** — the latter is delivered in this phase.

---

## 2. Strengths (worth preserving)

- **Composition-chain DI** (`base → page → api → db → a11y → visual → perf → net`) — Open/Closed; specs never change their import line.
- **Config-driven everything** (`@config/config` typed tree; zero hardcoded URLs/budgets/thresholds).
- **Stable, framework-owned result shapes** (a11y/perf/network) decoupled from vendor output.
- **Strict TypeScript, zero `any`**, now enforced by ESLint + Prettier + Husky (Phase 23).
- **One DB-seeding path** (`db:schema`) reused by Docker, GitHub Actions, Jenkins, and Azure.

---

## 3. Enterprise Enhancements — Status

| Enhancement               | Status         | Where / How                                                                                                   |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| **Route Mocking**         | ✅ Implemented | `@network` `NetworkManager.mock/mockJson`; `tests/network` (validated live).                                  |
| **Network Interception**  | ✅ Implemented | `NetworkManager.intercept/modifyResponse/abort/delay`.                                                        |
| **HAR Recording**         | ✅ Implemented | `NetworkManager.recordHar/replayFromHar`; HAR-replay test passes.                                             |
| **Secret Vault**          | ✅ Implemented | `@secrets` `SecretProvider` (Env + AES-GCM `VaultSecretProvider`); round-trip validated.                      |
| **Flaky Detection**       | ✅ Implemented | `custom-reporters/flaky-reporter.ts` → `reports/flaky.json` (wired in `playwright.config`).                   |
| **Test Analytics**        | ✅ Implemented | `reports/summary.json` (summary reporter) + a11y/perf dashboards; JUnit/Allure in CI.                         |
| **Dashboard Generation**  | ✅ Implemented | `reports/accessibility/index.html`, `reports/performance/index.html`; Allure on GitHub Pages (P20).           |
| **GitHub CodeQL**         | ✅ Implemented | `.github/workflows/codeql.yml` (security-and-quality queries).                                                |
| **OWASP Dependency Chk**  | ✅ Implemented | `.github/workflows/security.yml` (Dependency-Check Action + `npm audit`).                                     |
| **SonarQube/Cloud**       | ✅ Implemented | `sonar-project.properties` + SonarCloud job (ingests `coverage/lcov.info`).                                   |
| **Distributed Execution** | 📝 Documented  | `npx playwright test --shard=i/n` across a CI matrix; merge reports via `blob` reporter + `merge-reports`.    |
| **Browser Grid**          | 📝 Documented  | Selenium Grid / Moon / Playwright service via `connectOptions`/`PW_TEST_CONNECT_WS_ENDPOINT` (snippet below). |

### Distributed execution (sharding) — copy/paste

```yaml
# CI matrix leg:
strategy: { matrix: { shard: [1, 2, 3, 4] } }
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
  - uses: actions/upload-artifact@v4
    with: { name: blob-${{ matrix.shard }}, path: blob-report }
# merge job:
  - run: npx playwright merge-reports --reporter=html ./all-blobs
```

### Browser grid — `connectOptions` (env-gated)

```ts
// playwright.config.ts (optional)
use: getEnvOptional('GRID_WS', '') !== ''
  ? { connectOptions: { wsEndpoint: getEnvOptional('GRID_WS', '') } }
  : {},
```

---

## 4. Recommended Next Steps (prioritised)

1. **High** — Extract `@utils/report.util` + `HtmlDashboard` base (kills finding #1, debounces #7).
2. **High** — Remove the misleading `flaky` field from `summary-reporter` (finding #2) now that `flaky-reporter` is authoritative.
3. **Medium** — Add CI sharding (finding #9) + Docker-pinned visual baselines (finding #15).
4. **Medium** — Log rotation + env-gated file logging (finding #8).
5. **Low** — Generic `BaseRepository<T, Id>` (finding #11); prune empty scaffold dirs (finding #4).

```

```
