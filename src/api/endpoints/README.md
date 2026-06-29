# API Endpoints — OMINQA Playwright Framework

- **Purpose** — Domain-specific **endpoint path** modules (one per API), each the single source of truth for that API's routes, exposed through a barrel (`@api/endpoints`). Paths are relative to each service's base URL; functions are used where a segment is dynamic (e.g. `/booking/:id`).

## Why this folder exists

A vendor route change should be a **one-line edit** in one obvious place — not a find-and-replace across services/tests. Splitting routes by domain keeps each module small, focused, and discoverable, and avoids one ever-growing constants file.

## When to use it

- Add/adjust a route for an existing API → edit that domain module.
- Add a new API that has a service → add a `<domain>.endpoints.ts` + export it from the barrel.
- **Do NOT** duplicate a path string in a service/test — import the constant.

## Files

| File                   | Responsibility                                                 |
| ---------------------- | -------------------------------------------------------------- |
| `booking.endpoints.ts` | `RESTFUL_BOOKER_ENDPOINTS` — auth, ping, booking CRUD.         |
| `user.endpoints.ts`    | `REQRES_ENDPOINTS` — users, register, login.                   |
| `product.endpoints.ts` | `DUMMYJSON_ENDPOINTS` — auth login, products, search, carts.   |
| `post.endpoints.ts`    | `JSONPLACEHOLDER_ENDPOINTS` — posts, comments, users.          |
| `pet.endpoints.ts`     | `PETSTORE_ENDPOINTS` — pet CRUD, find-by-status, store orders. |
| `index.ts`             | Barrel export (`@api/endpoints`).                              |

## How it integrates

- **Consumed by** every service in `@services/*.api.ts` via `@api/endpoints` (e.g. `product.api` → `DUMMYJSON_ENDPOINTS`). `auth.api` composes booker + dummyjson routes.
- **Moved from** the former `src/constants/api-endpoints.constants.ts` (now deleted) — definitions live here once; nothing is duplicated.

## Design / enterprise principles

- **SRP / KISS** — one API's routes per module.
- **DRY** — single source of truth per route; dynamic segments via typed functions.
- **Barrel exports** — stable `@api/endpoints` import surface.

## Deliberately not added

- `employee.endpoints.ts` — employees have **no HTTP API** in OminQA (they are accessed via the DB Repository layer / SQL), so an endpoint module would be dead code.
- `auth.endpoints.ts` — auth has no routes of its own; it reuses Booker `/auth` and DummyJSON `/auth/login` from the booking/product modules.
