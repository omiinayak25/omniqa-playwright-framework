# Features (BDD) — OMINQA Playwright Framework

- **Purpose** — Gherkin `.feature` files describing behaviour in business language, executed by Cucumber-JS against the `step-definitions/`.

## Files

| File                      | Responsibility                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `saucedemo-login.feature` | BDD coverage of SauceDemo login outcomes across user types (Background + Scenario + Scenario Outline/Examples). Tags: `@ui @saucedemo @smoke @regression`. |
| `booking-api.feature`     | BDD coverage of Restful-Booker booking create/retrieve/delete (Scenario + Data Table + Doc String). Tags: `@api @booking @smoke @regression`.              |

## Responsibilities

- Express scenarios in Given/When/Then Gherkin, decoupled from implementation.
- Carry tags used for selective BDD runs.

## Dependencies

- Gherkin syntax only; bound at runtime to `step-definitions/` via `cucumber.js`.

## Interacts With

- Steps implemented in `step-definitions/`; runtime context/hooks provided by `@bdd` (`src/cucumber`).

## Usage Example

```bash
npm run test:bdd            # run all feature files (cucumber-js)
npm run test:bdd:smoke      # run @smoke-tagged scenarios
```
