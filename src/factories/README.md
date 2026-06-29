# Factories — OMINQA Playwright Framework

- **Purpose** — **Factory pattern** for test data: produce **datasets, bulk, and positive/negative/edge** collections, composing the `@builders` layer (and faker directly for trivial models). Builders make _one_ configurable object; factories make _many_ / curated sets.

## Why this folder exists

Tests often need more than one object (bulk inserts, dataset-driven cases) or curated negative/edge collections. Centralising this prevents copy-pasted loops and keeps "what data does this suite need?" in one place.

## When to use it

- You need **N objects** (bulk) or a **labelled set** of invalid/edge cases.
- A data shape is **trivial** (e.g. `{name, job}`) — the factory builds it directly (no builder needed).
- For a **single rich object**, use the Builder directly; reach for a factory when you need many or curated variants.

## Files

| File                   | Responsibility                                                                |
| ---------------------- | ----------------------------------------------------------------------------- |
| `factory.ts`           | `generate<T>(count, make)` — shared bulk primitive.                           |
| `booking.factory.ts`   | `BookingFactory` — valid/many/edge/`invalidCases` (composes BookingBuilder).  |
| `employee.factory.ts`  | `EmployeeFactory` — valid/inactive/many/forDepartment/edge/`invalidCases`.    |
| `product.factory.ts`   | `ProductFactory` — valid/many/edge/invalid (composes ProductBuilder).         |
| `user.factory.ts`      | `UserFactory` — valid/withJob/many/edge (faker; no builder for `{name,job}`). |
| `test-data.factory.ts` | `TestDataFactory` — facade over all factories + generic `dataset()`.          |
| `index.ts`             | Barrel export (`@factories`).                                                 |

## How it integrates

- **Composes `@builders`** (no duplicated construction) and reuses `@models`.
- **Consumed by** specs and BDD steps. Live integration: `step-definitions/database.steps.ts` sources its two-row transaction from `EmployeeFactory.many(2)`.

## Design / enterprise principles

- **Composition over inheritance** — factories delegate to builders.
- **DRY** — one `generate()` primitive; no repeated `Array.from`.
- **Strict TypeScript** — generics, readonly invalid-case tuples, no `any`.

## Usage Example

```ts
import { TestDataFactory, EmployeeFactory } from '@factories';

const team = EmployeeFactory.forDepartment(2, 5); // 5 QA employees
const bookings = TestDataFactory.booking.many(10); // 10 random bookings
for (const { label, employee } of EmployeeFactory.invalidCases()) {
  /* negative test */
}
```
