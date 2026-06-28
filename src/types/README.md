# Types — OMNIQA Playwright Framework

- **Purpose** — Shared, cross-cutting **TypeScript types**: small reusable primitives (utility, mapped, discriminated-union, generic) plus a single `@apptypes` import surface that **re-exports** the canonical types already owned by their modules. No domain models are redefined here.

## Why this folder exists

Some types are used across many layers (an optional value, a deep-immutable snapshot, a success/failure result). Defining them once — and offering one import surface for the canonical cross-cutting types — keeps signatures consistent without duplicating `@models`/module types.

## When to use it

- You need a **generic/utility** type reused across layers (`Maybe`, `Result`, `DeepReadonly`).
- You want the **canonical** `ApiResponse` / `PerformanceMetrics` / `AccessibilityResult` from one place.
- **Do NOT** redefine a type that a module already owns — re-export it instead. (This is why there is no second `ApiResponse`, `PerformanceMetrics`, `NetworkRecord`, or `FixtureContext` — they live in `@models`, `@performance`, `@network`, `@fixtures`.)

## Files

| File                  | Responsibility                                                                  |
| --------------------- | ------------------------------------------------------------------------------- |
| `common.types.ts`     | `Maybe<T>` (utility), `DeepReadonly<T>` (mapped), `Result<T,E>` (discriminated). |
| `execution.types.ts`  | `Environment` (alias), `BrowserName` (union), `ExecutionContext` (immutable).    |
| `index.ts`            | Barrel: the above + re-exports (`ApiResponse`, `PerformanceMetrics`, `AccessibilityResult`). |

## How it integrates (every export has a real consumer)

| Type | Consumer |
| ---- | -------- |
| `Maybe<T>` | `EmployeeRepository.findById/findByEmail` returns |
| `DeepReadonly<T>` | builds `ExecutionContext` |
| `Result<T,E>` | `StorageStateHelper.resolveSession()` |
| `ExecutionContext` / `Environment` / `BrowserName` | `EnvironmentHelper.context()` |
| `ApiResponse` (re-export) | `api-common.steps.ts` |
| `PerformanceMetrics` (re-export) | `performance.steps.ts` |
| `AccessibilityResult` (re-export) | `accessibility.steps.ts` |

## Design / enterprise principles

- **Strict TypeScript features** — generics (`Maybe`, `Result`), mapped type (`DeepReadonly`), discriminated union (`Result`), `readonly`, literal union (`BrowserName`).
- **No duplication** — re-export canonical types; never redefine models.
- **No dead code** — every export is wired to a consumer.

## Usage Example

```ts
import type { Maybe, Result, ExecutionContext } from '@apptypes';

function describe(ctx: ExecutionContext): string { return `${ctx.environment}/${ctx.browser}`; }
const found: Maybe<number> = null;
const r: Result<string> = { ok: false, error: 'missing' };
if (r.ok) console.log(r.value); else console.log(r.error); // discriminated, exhaustive
```

## Deliberately not added (judgment)

`Pagination<T>` (no generic consumer; ReqRes pagination is app-specific), `RetryOptions` (covered by `RequestOptions.retries`), `VisualComparison` (no comparison-result is produced — runner uses `toHaveScreenshot`), `NetworkRecord`/`FixtureContext` (already defined in `@network`/`@fixtures`). Adding them would be dead or duplicated code.
