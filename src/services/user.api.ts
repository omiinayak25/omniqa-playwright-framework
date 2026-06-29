/**
 * --------------------------------------------------------
 * File: user.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Business service for the ReqRes user resource (list/get/create/update/delete).
 *
 * Responsibilities:
 * - List users with pagination
 * - Get a user by id
 * - Create / update / delete a user
 *
 * Used By:
 * api.fixtures.ts, tests/api/* (ReqRes user CRUD + contract specs)
 *
 * Dependencies:
 * ApiClient, REQRES_ENDPOINTS, ApiResponse,
 * CreateUserRequest/CreateUserResponse/PaginatedUsers/ReqResUser models
 *
 * Last Updated: 2026-06-27
 * Notes:
 * ReqRes requires an `x-api-key` header; it is injected via the ApiClient's
 * default headers (configured in the fixture), so methods here stay header-free.
 * --------------------------------------------------------
 */
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the ReqRes endpoint path builders.
import { REQRES_ENDPOINTS } from '@api/endpoints';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the ReqRes user domain models (type-only).
import type {
  // Request payload to create/update a user.
  CreateUserRequest,
  // Response shape echoed on create/update.
  CreateUserResponse,
  // Paginated list-users response shape.
  PaginatedUsers,
  // A single ReqRes user.
  ReqResUser,
} from '@models/reqres.model';

/**
 * UserAPI
 *
 * Business-layer service mapping ReqRes user operations onto HTTP calls via the
 * injected ApiClient. SRP: user semantics here; transport (and the injected
 * x-api-key default header) handled by ApiClient.
 */
// Declare the ReqRes user service.
export class UserAPI {
  /** @param client ApiClient bound to the ReqRes base URL (carries x-api-key). */
  // Inject the ApiClient (bound to ReqRes; carries the x-api-key header).
  constructor(private readonly client: ApiClient) {}

  /**
   * List users with pagination.
   * @param page 1-based page number (default 1).
   * @returns GET /users response with the paginated user list.
   */
  // List users with pagination (GET /users?page=...).
  public async list(page = 1): Promise<ApiResponse<PaginatedUsers>> {
    // GET the users endpoint with the page query param.
    return this.client.get<PaginatedUsers>(REQRES_ENDPOINTS.USERS, { params: { page } });
  }

  /**
   * Fetch a single user.
   * @param id User id.
   * @returns GET /users/:id response; the user is wrapped in a `{ data }` envelope.
   */
  // Fetch a single user (GET /users/:id, wrapped in { data }).
  public async getById(id: number): Promise<ApiResponse<{ data: ReqResUser }>> {
    // GET the id-scoped user endpoint.
    return this.client.get<{ data: ReqResUser }>(REQRES_ENDPOINTS.USER_BY_ID(id));
  }

  /**
   * Create a user.
   * @param payload New user payload (name/job).
   * @returns POST /users response echoing the created user with id/createdAt.
   */
  // Create a user (POST /users).
  public async create(payload: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
    // POST the new user payload.
    return this.client.post<CreateUserResponse>(REQRES_ENDPOINTS.USERS, { data: payload });
  }

  /**
   * Update a user.
   * @param id User id.
   * @param payload Updated user payload.
   * @returns PUT /users/:id response with the updated fields and updatedAt.
   */
  // Update a user (PUT /users/:id).
  public async update(
    id: number,
    payload: CreateUserRequest,
  ): Promise<ApiResponse<CreateUserResponse>> {
    // PUT the updated payload to the id-scoped endpoint.
    return this.client.put<CreateUserResponse>(REQRES_ENDPOINTS.USER_BY_ID(id), { data: payload });
  }

  /**
   * Delete a user.
   * @param id User id.
   * @returns DELETE /users/:id response (204 No Content on success).
   */
  // Delete a user (DELETE /users/:id → 204).
  public async remove(id: number): Promise<ApiResponse<string>> {
    // DELETE the id-scoped user endpoint.
    return this.client.delete<string>(REQRES_ENDPOINTS.USER_BY_ID(id));
  }
}
