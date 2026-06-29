# Contributing to OminQA

> **OminQA · Enterprise Playwright Automation Framework**
> Thank you for contributing. This guide keeps the codebase consistent, typed, and reviewable.

---

## Project Standards

- **Strict TypeScript**, never `any` (prefer `unknown`); honour `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature`.
- **No assertions in `src/`** — page objects, services, and repositories expose state; **specs** (`tests/`, `step-definitions/`) assert.
- **No hardcoded values** — everything flows from `.env` → `@config/config`.
- **No fixed sleeps** — Playwright web-first auto-waiting only.
- **Composition over inheritance** for UI components.
- Every `src/` file begins with the standard doc-block header (`File / Module / Purpose / Responsibilities / Used By / Dependencies / Notes`).

## Coding Guidelines

- Use **path aliases** (`@utils/...`), never deep relative imports (`../../...`) — enforced by ESLint `no-restricted-imports`.
- Add behaviour by **extending a fixture layer**, not by `new`-ing objects inside specs.
- Keep public surfaces stable via barrels (`index.ts`) and `@fixtures/index`.
- Run the gate before every commit:

  ```bash
  npm run verify     # tsc --noEmit + eslint + prettier --check
  ```

  Husky runs `lint-staged` on pre-commit and `typecheck` on pre-push automatically.

## Commit Messages (Conventional Commits)

Enforced by commitlint (`commit-msg` hook). Format:

```
<type>(<optional scope>): <subject>

# types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Examples: `feat(network): add response throttling`, `fix(db): close pool on teardown`, `docs(readme): sync stats`.

## Naming Rules

| Kind          | Convention                                         |
| ------------- | -------------------------------------------------- |
| Page object   | `*.page.ts` → `class XxxPage extends BasePage`     |
| Component     | `*.component.ts`                                   |
| API service   | `*.api.ts`                                         |
| Repository    | `*.repository.ts`                                  |
| Flow          | `*.flow.ts`                                        |
| Fixture layer | `*.fixtures.ts`                                    |
| Spec          | `*.spec.ts` (Playwright) / `*.steps.ts` (Cucumber) |
| Constants     | `*.constants.ts` (`UPPER_SNAKE` values)            |
| Model / types | `*.model.ts` / `*.types.ts`                        |

Classes `PascalCase`; functions/vars `camelCase`; constants `UPPER_SNAKE`.

## Folder Rules

- New feature module → `src/<module>/` with a `@<module>/*` alias and a barrel `index.ts`.
- Specs mirror modules under `tests/<module>/`; add a Playwright `project` if isolation is needed.
- Do not add code to the reserved-but-empty dirs (`builders/factories/helpers/middlewares/types`) without also wiring them in.

## Testing Rules

- Assertions only in specs/steps. Tag tests `@smoke` / `@regression` where appropriate.
- Use the relevant fixture: `a11y`, `visual`, `perf`, `network`, `db`, page objects, API services.
- New tests must pass locally and not depend on order. Prefer deterministic data (Faker) and network determinism (`@network`/HAR).

## Pull Request Rules

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. `npm run verify` passes; new/changed tests pass.
3. Keep diffs focused; update docs when behaviour or stats change.
4. Conventional-commit title; clear description; link any issue.
5. CI (GitHub Actions / CodeQL / Security) must be green.

## Local Setup

```bash
nvm use && npm install && npm run install:browsers
cp .env.example .env
npm run verify
```
