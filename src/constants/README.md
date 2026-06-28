# Constants — OMNIQA Playwright Framework

- **Purpose** — Named constants (HTTP enums, endpoints, UI routes, timeouts, paths) so code references symbols instead of magic numbers/strings.

## Files

| File                         | Responsibility                                                              |
| ---------------------------- | --------------------------------------------------------------------------- |
| `index.ts`                   | Barrel re-exporting timeouts, http, and ui-routes constants.                |
| `http.constants.ts`          | `HttpStatus` codes, HTTP methods, header names, and content types.          |
| `ui-routes.constants.ts`     | UI route paths relative to each app's base URL.                             |
| `timeouts.constants.ts`      | Named millisecond timeout constants for waits, polls, and API calls.        |
| `paths.constants.ts`         | Filesystem path constants (e.g. storage-state auth files).                  |

> Note: `paths.constants.ts` is not part of the `index.ts` barrel — import it directly where needed.
> Note: API endpoint paths moved to domain modules under `src/api/endpoints` (import via `@api/endpoints`).

## Responsibilities

- Provide centralized, named constants used across API, UI, and assertions.
- Keep header/content-type spelling, status codes, routes, and timeouts consistent everywhere.

## Dependencies

- None (plain literals/enums; `index.ts` re-exports the sibling modules).

## Interacts With

- Consumed by `@api/*`, `@services/*`, `@pages/*`, `@database/*`, hooks, and tests.

## Usage Example

```ts
import { HttpStatus, TIMEOUTS, SAUCEDEMO_ROUTES } from '@constants/index';

ResponseValidator.for(res).status(HttpStatus.OK);
```
