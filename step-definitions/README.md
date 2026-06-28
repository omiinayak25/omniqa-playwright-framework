# Step Definitions (BDD) — OMNIQA Playwright Framework

- **Purpose** — Cucumber-JS step implementations that bind the Gherkin steps in `features/` to executable code, running `this`-bound to the `CustomWorld`.

## Files

| File                 | Responsibility                                                                          |
| -------------------- | --------------------------------------------------------------------------------------- |
| `saucedemo.steps.ts` | Implements the Given/When/Then steps for `features/saucedemo-login.feature` (UI login). |
| `booking.steps.ts`   | Implements the steps for `features/booking-api.feature` (Restful-Booker booking flows). |

## Responsibilities

- Map Gherkin phrases to actions using the World's Playwright `page`/`apiContext` and shared state bag.
- Reuse framework page objects, services, and assertions instead of duplicating logic.

## Dependencies

- `@cucumber/cucumber` (Given/When/Then), `@bdd/world` (`CustomWorld`)
- Framework layers as needed (`@pages/*`, `@services/*`, `@constants/*`, `@models/*`).

## Interacts With

- Loaded by the Cucumber runner alongside `@bdd` hooks; matched against `features/*.feature`.

## Usage Example

```bash
npm run test:bdd       # cucumber-js loads these step definitions
```
