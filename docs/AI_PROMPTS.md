# OmniQA — AI Prompts (Ready-to-Use)

> **OmniQA · Enterprise Playwright Automation Framework**
> Copy/paste prompts for continuing development. All 24 build phases are complete, so these target
> **maintenance, enhancement, and the documented roadmap** rather than initial construction.
> Last synchronized: 2026-06-28.

---

## Ground Rules (paste at the top of any prompt)

```
Analyze the actual repository before changing anything — do not assume.
Keep assertions out of src/. Use the fixture DI chain (import from @fixtures/index).
Strict TypeScript, never `any`. No hardcoded values. Web-first waits only.
Run `npm run verify` (typecheck + lint + format:check) and validate live before finishing.
Use Conventional Commits.
```

## Roadmap Items

```
Extract a shared @utils/report.util (escapeHtml, slugify) and a HtmlDashboard base class, then
refactor src/accessibility/accessibility-reporter.ts and src/performance/performance-reporter.ts to
use it. Keep behaviour identical; validate with npm run verify.
```

```
Remove the misleading `flaky` field from src/custom-reporters/summary-reporter.ts (it uses the
`interrupted` status). The dedicated flaky-reporter.ts is authoritative. Update any docs that mention it.
```

```
Wire distributed execution: add `--shard=i/n` to a GitHub Actions matrix using the `blob` reporter and
a merge-reports job. Document and validate the workflow YAML.
```

```
Add browser-grid support: an env-gated `connectOptions` in playwright.config.ts driven by GRID_WS /
PW_TEST_CONNECT_WS_ENDPOINT. Default off; document Selenium Grid / Moon usage.
```

```
Add log rotation to src/utils/logger.ts (winston-daily-rotate-file) and gate file transports behind an
env flag. Keep console + correlation IDs unchanged.
```

```
Introduce a generic BaseRepository<TEntity, TId> in src/repositories and refactor the concrete repos
to extend it without changing their public methods.
```

## Add Capabilities

```
Add a new API service src/services/<name>.api.ts on top of ApiClient with typed models in src/models,
an AJV schema in src/schemas, and api.fixtures wiring. Add tests/api/<name>.spec.ts.
```

```
Add a new Page Object src/pages/<app>/<screen>.page.ts extending BasePage (locators/actions only, no
assertions), wire it into page.fixtures, and add a spec under tests/ui.
```

```
Add a new feature module src/<module>/ (types + manager + index barrel), a @<module>/* alias, a fixture
layer, a Playwright project, env vars (+ .env.example + config validation), and tests.
```

## Testing & Quality

```
Generate Playwright tests for <feature>. Assertions live in the spec; use the relevant fixture
(a11y/visual/perf/network). Tag with @smoke/@regression. Run them live.
```

```
Run npm run verify and npm run coverage. Fix any lint/type/format issues. Report coverage from
coverage/lcov.info. Do not weaken strictness.
```

```
Review the current diff like a Principal SDET: correctness, type-safety, no assertions in src/, fixture
usage, naming, and test coverage. Produce a prioritised findings table.
```

## CI/CD & Security

```
Update .github/workflows/ci.yml to <change>. Keep the Postgres service + npm run db:schema seeding.
Validate the YAML and explain each step.
```

```
Review SECURITY.md and the CodeQL/OWASP/Sonar configs against the current code. Flag any secret leak,
unparameterised query, or unsafe log. Fix and re-validate.
```

## Documentation

```
Re-audit the repository and re-synchronize README.md, docs/PROJECT_METADATA.md, CHANGELOG.md,
docs/PROJECT_ANALYSIS.md, docs/AI_HANDOVER.md, ROADMAP.md. Only document features that exist; measure
all statistics from the code; fix any contradictions.
```
