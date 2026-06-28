# BDD Runtime (Cucumber) — OMNIQA Playwright Framework

- **Purpose** — Cucumber-JS runtime support: the per-scenario World and lifecycle hooks that drive Playwright for BDD scenarios. Aliased as `@bdd`.

## Files

| File       | Responsibility                                                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world.ts` | `CustomWorld` — per-scenario context holding Playwright `context`/`page`/`apiContext`, a scoped logger, and a typed get/set state bag; registered as the World constructor.                                                                  |
| `hooks.ts` | Cucumber lifecycle hooks — `BeforeAll`/`AfterAll` launch/close one shared browser; `Before` builds a fresh context/page/apiContext per scenario (`@auth` reuses stored storageState); `After` screenshots on failure and disposes resources. |

## Responsibilities

- Provide per-scenario isolation (fresh World + browser context) analogous to Playwright fixtures.
- Share one browser across the BDD run for speed while isolating each scenario.
- Carry state between steps and capture failure screenshots.

## Dependencies

- `@cucumber/cucumber` (World, hooks, Status), `@playwright/test` (chromium, request, types)
- `@config/config`, `@constants/paths.constants`, `@utils/logger`, `@utils/file.util`

## Interacts With

- Loaded by the Cucumber runner (`cucumber.js`) alongside `step-definitions/`; consumes `features/`.

## Usage Example

```ts
// step-definitions use the World via `this`
import { Given } from '@cucumber/cucumber';
import type { CustomWorld } from '@bdd/world';

Given('I am on the SauceDemo login page', async function (this: CustomWorld) {
  await this.page.goto(/* ... */);
});
```
