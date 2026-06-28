# API Core (Client & Validation) — OMNIQA Playwright Framework

- **Purpose** — Transport and validation primitives for API testing: a reusable HTTP client over Playwright's `APIRequestContext`, plus response and JSON-schema validators. Service classes (`@services`) build on these.

## Files

| File                    | Responsibility                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clients/api-client.ts` | `ApiClient` — transport wrapper: URL/header building, all HTTP verbs, normalized `ApiResponse<T>`, masked logging, and retry with exponential backoff on network errors and 5xx. |
| `response-validator.ts` | `ResponseValidator` — fluent, chainable assertions (status, `ok`, `maxTime`, `matchesSchema`, `hasHeader`) that throw descriptive errors.                                        |
| `schema-validator.ts`   | `validateSchema()` — AJV-backed JSON Schema contract validation with a compiled-validator cache and flattened error messages.                                                    |

## Responsibilities

- Move bytes over the wire and normalize responses (`ApiClient`), with no assertions or domain knowledge.
- Express response expectations declaratively (`ResponseValidator`).
- Validate response bodies against JSON schemas for contract testing (`schema-validator`).

## Dependencies

- `@playwright/test` (APIRequestContext, APIResponse), `ajv`, `ajv-formats`
- `@utils/logger`, `@utils/wait.util`, `@utils/crypto.util`
- `@constants/http.constants`, `@models/api.model`, `@schemas/*`

## Interacts With

- Instantiated by `@services/*.api.ts` service classes; injected via `@fixtures/api.fixtures`; used by `tests/api/*`.

## Usage Example

```ts
import { ApiClient } from '@api/clients/api-client';
import { ResponseValidator } from '@api/response-validator';

const client = new ApiClient(request, baseUrl);
const res = await client.get('/booking');
ResponseValidator.for(res).status(200).maxTime(2000);
```
