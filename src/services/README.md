# API Services — OMNIQA Playwright Framework

- **Purpose** — Business-layer service classes, one per REST resource. Each maps domain operations to HTTP calls on an injected `ApiClient`, owning resource-specific details (auth schemes, endpoints) so tests never deal with header plumbing.

## Files

| File             | Responsibility                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `auth.api.ts`    | `AuthAPI` — Restful-Booker token issuance (cookie auth) and DummyJSON Bearer login.              |
| `booking.api.ts` | `BookingAPI` — full CRUD + health ping over Restful-Booker `/booking` (cookie-based write auth). |
| `pet.api.ts`     | `PetAPI` — Swagger Petstore `/pet` CRUD and status queries.                                      |
| `post.api.ts`    | `PostAPI` — JSONPlaceholder posts and users (keyless, reliable target).                          |
| `product.api.ts` | `ProductAPI` — DummyJSON products resource.                                                      |
| `user.api.ts`    | `UserAPI` — ReqRes user resource (list/get/create/update/delete).                                |

## Responsibilities

- Encapsulate per-resource HTTP semantics and endpoints.
- Own auth details (Restful-Booker token cookie, DummyJSON Bearer) per request.
- Return typed `ApiResponse<T>` for tests to validate; delegate transport/retry/logging to `ApiClient`.

## Dependencies

- `@api/clients/api-client` (`ApiClient`)
- `@constants/api-endpoints.constants`, `@constants/http.constants`
- `@config/config`, `@models/*` (resource models)

## Interacts With

- Injected into specs via `@fixtures/api.fixtures`; used across `tests/api/*` and API-touching E2E specs.

## Usage Example

```ts
import { BookingAPI } from '@services/booking.api';
import { ApiClient } from '@api/clients/api-client';

const booking = new BookingAPI(new ApiClient(request, baseUrl));
const res = await booking.getById(1);
```
