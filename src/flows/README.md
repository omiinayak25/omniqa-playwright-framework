# Business Flows — OMINQA Playwright Framework

- **Purpose** — Facade layer over the POM: orchestrates multi-screen user journeys behind one intention-revealing method, so journeys repeated across many tests are written once. Flows contain no assertions.

## Files

| File                         | Responsibility                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `saucedemo/checkout.flow.ts` | `CheckoutFlow` — drives the full SauceDemo purchase journey (inventory → cart → info → overview → complete) and exposes order totals for assertions. |

## Responsibilities

- Compose several page objects and sequence multi-screen actions into a single reusable method.
- Return values (confirmation text, totals) for tests to assert on; never assert internally.
- Keep cross-screen orchestration out of individual specs.

## Dependencies

- `@playwright/test` (Page type)
- `@pages/saucedemo/*` (the composed page objects)
- `@models/user.model` (`CheckoutInfo`), `@utils/logger`

## Interacts With

- Called by `tests/ui/saucedemo/checkout.spec.ts` and `tests/e2e/saucedemo-purchase.e2e.spec.ts`.

## Usage Example

```ts
import { CheckoutFlow } from '@flows/saucedemo/checkout.flow';

const flow = new CheckoutFlow(page);
const confirmation = await flow.purchase(['Sauce Labs Backpack'], info);
```
