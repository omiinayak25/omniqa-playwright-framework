# Database Access — OMNIQA Playwright Framework

- **Purpose** — Low-level PostgreSQL access layer: a shared connection pool, a typed parameterized query runner, reusable DB assertions, and an availability probe.

## Files

| File                 | Responsibility                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `db-pool.ts`         | Owns the single process-wide `pg` connection pool (lazy Singleton via `getPool`/`closePool`).                                      |
| `query-runner.ts`    | `QueryRunner` — typed parameterized queries plus `one`/`maybeOne`/`none` helpers and a transaction wrapper (auto COMMIT/ROLLBACK). |
| `db-assertions.ts`   | `DbAssertions` — intention-revealing DB assertions that throw descriptive errors.                                                  |
| `db-availability.ts` | Probe whether PostgreSQL is reachable so DB-dependent specs can skip gracefully.                                                   |

## Responsibilities

- Provide one shared pool reused across queries for the process lifetime.
- Execute injection-safe parameterized SQL (`$1, $2 …`) and return typed rows.
- Offer transaction support and reusable assertions on table/row state.

## Dependencies

- `pg` (Pool, PoolClient, QueryResultRow)
- `@config/config`, `@utils/logger`

## Interacts With

- Used by `@repositories/*`, `@fixtures/db.fixtures`, and `tests/db/*`; pool is closed in `@hooks/global-teardown`.

## Usage Example

```ts
import { QueryRunner } from '@database/query-runner';

const runner = new QueryRunner();
const rows = await runner.query('SELECT * FROM employees WHERE department_id = $1', [deptId]);
```
