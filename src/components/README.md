# UI Components — OMINQA Playwright Framework

- **Purpose** — Reusable UI component objects: widgets (header, table, pagination) that appear across many pages and are _composed_ into page objects (composition over inheritance — a page HAS-A header).

## Files

| File                                | Responsibility                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `base.component.ts`                 | Abstract base for all components: holds the `page`, a scoped `root` Locator, a scoped logger, and a shared `isVisible()` check. |
| `orangehrm/data-table.component.ts` | Wrapper over OrangeHRM's `oxd` data grid — wait for rows, read row counts and cell/column values.                               |
| `orangehrm/pagination.component.ts` | Wrapper over OrangeHRM's pagination control, composed into list pages.                                                          |
| `saucedemo/header.component.ts`     | Models the SauceDemo top bar (burger menu + cart link).                                                                         |

## Responsibilities

- Model reusable widgets scoped to a `root` Locator so internal locators stay relative.
- Provide widget behaviour (read grid cells, open cart, navigate pages) once, reused wherever mounted.
- Keep widget logic out of page objects, which compose components instead of re-declaring selectors.

## Dependencies

- `@playwright/test` (Page, Locator types)
- `@utils/logger` (scoped logging)

## Interacts With

- Composed into `@pages` page objects (e.g. `OrangePimPage.table`, SauceDemo inventory header).

## Usage Example

```ts
import { DataTableComponent } from '@components/orangehrm/data-table.component';

const table = new DataTableComponent(page);
await table.waitForLoaded();
const names = await table.columnValues(1);
```
