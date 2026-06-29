# Tests — OMINQA Playwright Framework

- **Purpose** — All Playwright Test specs, organized by layer (API, DB, E2E, UI) plus auth setup projects. Specs import the custom `test`/`expect` from `@fixtures/index`.

## Files

| File                                     | Responsibility                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `setup/auth.setup.ts`                    | Setup project — logs into SauceDemo once and saves storageState for reuse. |
| `setup/orange-auth.setup.ts`             | Setup project — logs into OrangeHRM once and saves storageState.           |
| `api/booking.spec.ts`                    | Restful-Booker booking API CRUD.                                           |
| `api/contract.spec.ts`                   | Contract / JSON-schema validation.                                         |
| `api/sanity.spec.ts`                     | Framework sanity smoke checks.                                             |
| `api/negative-boundary.spec.ts`          | Negative / boundary cases on Restful-Booker.                               |
| `api/sla-and-sorting.spec.ts`            | Response-time SLA and sorting checks.                                      |
| `api/logging.spec.ts`                    | Correlation-id logging and capture verification.                           |
| `api/fixtures.spec.ts`                   | Custom fixtures / DI verification.                                         |
| `api/config.spec.ts`                     | Configuration facade checks.                                               |
| `api/utils.spec.ts`                      | Crypto/util helper checks.                                                 |
| `api/reporting-allure.spec.ts`           | Allure reporting showcase.                                                 |
| `api/pet.spec.ts`                        | Swagger Petstore pet API.                                                  |
| `api/posts.spec.ts`                      | JSONPlaceholder post API.                                                  |
| `api/products.spec.ts`                   | DummyJSON product API.                                                     |
| `api/users.spec.ts`                      | ReqRes user API.                                                           |
| `db/employee.spec.ts`                    | PostgreSQL employee repository tests.                                      |
| `db/advanced.spec.ts`                    | PostgreSQL transactions / advanced DB tests.                               |
| `e2e/api-to-db-sync.e2e.spec.ts`         | E2E: API → DB product sync.                                                |
| `e2e/booking-lifecycle.e2e.spec.ts`      | E2E: booking lifecycle.                                                    |
| `e2e/employee-lifecycle.e2e.spec.ts`     | E2E: employee lifecycle.                                                   |
| `e2e/saucedemo-purchase.e2e.spec.ts`     | E2E: SauceDemo purchase journey.                                           |
| `ui/saucedemo/login.spec.ts`             | SauceDemo login.                                                           |
| `ui/saucedemo/login.data-driven.spec.ts` | SauceDemo data-driven login.                                               |
| `ui/saucedemo/inventory.spec.ts`         | SauceDemo inventory (authenticated).                                       |
| `ui/saucedemo/checkout.spec.ts`          | SauceDemo checkout flow.                                                   |
| `ui/orangehrm/login.spec.ts`             | OrangeHRM login.                                                           |
| `ui/orangehrm/pim.spec.ts`               | OrangeHRM PIM employee grid.                                               |
| `accessibility/.gitkeep`                 | Placeholder — directory defined but contains NO specs yet.                 |
| `visual/.gitkeep`                        | Placeholder — directory defined but contains NO specs yet.                 |
| `performance/.gitkeep`                   | Placeholder — directory defined but contains NO specs yet.                 |

> Note: `accessibility/`, `visual/`, and `performance/` are empty (only `.gitkeep`) — no specs are implemented there yet.

## Responsibilities

- Exercise the UI, API, DB, and E2E layers through the framework's fixtures, pages, services, and repositories.
- Tag specs (`@smoke`, `@regression`, `@api`, `@ui`, `@db`, `@e2e`, etc.) for selective runs.

## Dependencies

- `@fixtures/index` (custom `test`/`expect`), and through it `@pages/*`, `@services/*`, `@repositories/*`, `@schemas/*`, `@constants/*`, `@models/*`.

## Interacts With

- Driven by `playwright.config.ts` projects; auth setup specs produce storageState consumed by UI specs.

## Usage Example

```bash
npm test                 # run all
npm run test:api         # API project only
npm run test:ui          # ui-chromium project
npm run test:e2e         # E2E specs
npm run test:smoke       # @smoke-tagged specs
```
