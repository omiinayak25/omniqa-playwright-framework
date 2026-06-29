# JSON Schemas — OMINQA Playwright Framework

- **Purpose** — JSON Schema definitions for API contract testing, validated via AJV. One source of truth shared by the contract suite and individual specs.

## Files

| File                | Responsibility                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`          | Barrel: re-exports booking schemas and defines `PRODUCT_SCHEMA`/`PRODUCT_LIST_SCHEMA` (DummyJSON), `POST_SCHEMA` (JSONPlaceholder), and `PET_SCHEMA` (Petstore). |
| `booking.schema.ts` | `BOOKING_SCHEMA` and `CREATED_BOOKING_SCHEMA` for the Restful-Booker booking resource.                                                                           |

## Responsibilities

- Declare readonly (`as const`) JSON schemas describing expected response shapes.
- Provide one shared schema source for contract assertions.

## Dependencies

- None (plain JSON schema literals; consumed by AJV via `@api/schema-validator`).

## Interacts With

- Passed to `ResponseValidator.matchesSchema()` / `validateSchema()` in `tests/api/*` contract suites.

## Usage Example

```ts
import { BOOKING_SCHEMA } from '@schemas/index';
import { ResponseValidator } from '@api/response-validator';

ResponseValidator.for(res).matchesSchema(BOOKING_SCHEMA);
```
