# Domain Models — OMNIQA Playwright Framework

- **Purpose** — TypeScript interfaces/types describing the shape of API payloads, DB records, config, and shared domain entities used across UI, API, and DB layers.

## Files

| File                       | Responsibility                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `api.model.ts`             | Service-agnostic `ApiResponse<T>` and `RequestOptions` types.                                        |
| `config.model.ts`          | Config interfaces (`FrameworkConfig`, `UiConfig`, `ApiConfig`, `DatabaseConfig`, `ExecutionConfig`). |
| `booking.model.ts`         | Restful-Booker models (booking, created-booking, auth token).                                        |
| `dummyjson.model.ts`       | DummyJSON product, product list, new-product, and auth-response models.                              |
| `jsonplaceholder.model.ts` | JSONPlaceholder post, new-post, and user models.                                                     |
| `petstore.model.ts`        | Swagger Petstore status enum, category, pet, and new-pet models.                                     |
| `reqres.model.ts`          | ReqRes user, user list, and create-user request/response models.                                     |
| `product.model.ts`         | Generic product model used by SauceDemo UI and product APIs.                                         |
| `product-record.model.ts`  | Persisted product record and sync-input models for API→DB sync.                                      |
| `employee.model.ts`        | Employee models for the DB layer and E2E flows.                                                      |
| `department.model.ts`      | Department model (organizational unit referenced by employees).                                      |
| `user.model.ts`            | User/auth models (e.g. `UserCredentials`, `CheckoutInfo`) shared across layers.                      |

## Responsibilities

- Define typed contracts for request/response payloads, DB rows, and config.
- Provide shared domain types reused by services, repositories, pages, and fixtures.

## Dependencies

- `@playwright/test` (only `api.model.ts`, for the raw `APIResponse` type); otherwise plain TypeScript types.

## Interacts With

- Imported throughout `@api/*`, `@services/*`, `@repositories/*`, `@pages/*`, `@config/*`, and tests.

## Usage Example

```ts
import type { Booking } from '@models/booking.model';

const booking: Booking = {
  firstname: 'Jane',
  lastname: 'Doe',
  totalprice: 100,
  depositpaid: true,
  bookingdates: { checkin: '2026-06-27', checkout: '2026-06-28' },
};
```
