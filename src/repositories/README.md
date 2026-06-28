# Repositories — OMNIQA Playwright Framework

- **Purpose** — Repository pattern over the database tables: each repo exposes intention-revealing domain methods (findByEmail, insert, deactivate …) and keeps raw SQL out of tests and services.

## Files

| File                           | Responsibility                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `base.repository.ts`           | Abstract base holding the shared `QueryRunner`, requiring a `table` name, and providing a generic `count()`.      |
| `employee.repository.ts`       | `employees` table — lookups, insert, salary update, deactivate/delete, and a `give_raise()` stored-function call. |
| `department.repository.ts`     | `departments` table — the parent side of the department/employee relationship.                                    |
| `product-record.repository.ts` | `products` table — DB sink that persists synced product records.                                                  |

## Responsibilities

- Map domain operations to parameterized SQL via the inherited `QueryRunner`.
- Return typed domain models from `@models/*`.
- Keep all SQL in one place per table; every query is injection-safe.

## Dependencies

- `@database/query-runner` (`QueryRunner`), `@repositories/base.repository`
- `@models/*` (employee, department, product-record models)

## Interacts With

- Injected via `@fixtures/db.fixtures`; used by `tests/db/*` and DB-touching E2E specs.

## Usage Example

```ts
import { EmployeeRepository } from '@repositories/employee.repository';

const repo = new EmployeeRepository();
const employee = await repo.findByEmail('jane@example.com');
```
