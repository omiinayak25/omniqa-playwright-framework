# Builders — OMNIQA Playwright Framework

- **Purpose** — Fluent **Builder pattern** for test data. Each builder seeds a valid, randomized domain object and exposes chainable `withX()` mutators plus intention-revealing valid/invalid/boundary variants, so tests declare the data they need instead of hand-assembling literals.

## Why this folder exists

Hand-written object literals scattered across specs/steps cause drift, duplication, and unclear intent (what makes this payload "invalid"?). Builders centralise construction: one valid default, explicit variants, and immutable `build()` output.

## When to use it

- A payload has **multiple fields, nested structure, or negative/boundary variants** (e.g. a `Booking`, `NewEmployee`).
- A test needs **deliberately invalid** data (negative salary, missing postal code) with a readable name.
- **Do NOT** add a builder for a trivial 1–2 field model — construct it inline. (This is why there is no `UserBuilder` for `{name, job}` and no `OrderBuilder` until an `Order` type exists.)

## Files

| File                  | Responsibility                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| `builder.ts`          | `AbstractBuilder<T>` — generic base: `with()` overrides + immutable `build()`.        |
| `booking.builder.ts`  | `BookingBuilder` — Restful-Booker `Booking` (dates, price, deposit, needs; negatives).|
| `employee.builder.ts` | `EmployeeBuilder` — `NewEmployee` (unique email, salary CHECK + FK invalid variants). |
| `checkout.builder.ts` | `CheckoutBuilder` — `CheckoutInfo` (valid + missing-field variants).                  |
| `product.builder.ts`  | `ProductBuilder` — `NewProduct` (valid + zero/negative price, title-only).            |
| `index.ts`            | Barrel export (`@builders`).                                                          |

## How it integrates

- **Reuses** existing `@models/*` shapes and `@faker-js/faker` (no new types, no duplication).
- **Consumed by** `@factories/*` (bulk/datasets), specs, and BDD steps. Example integration: `step-definitions/checkout.steps.ts` builds its valid customer via `CheckoutBuilder.valid().build()`.

## Design / enterprise principles

- **SOLID** — each builder has one responsibility; the base is open for extension (new builders) without modification.
- **Composition over inheritance** — factories compose builders; static variants compose `valid()`.
- **Strict TypeScript** — generics + `Partial<T>` overrides, no `any`, immutable `build()` copies.

## Usage Example

```ts
import { BookingBuilder, EmployeeBuilder } from '@builders';

const booking = BookingBuilder.valid().withGuest('Ada', 'Lovelace').withPrice(500).build();
const badSalary = EmployeeBuilder.invalidNonPositiveSalary().build();
```
