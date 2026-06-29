/**
 * --------------------------------------------------------
 * File: pet.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Business service for the Swagger Petstore /pet resource, covering CRUD and
 * status-based filtering.
 *
 * Responsibilities:
 * - Create / update a pet
 * - Get a pet by id
 * - Find pets by status (available/pending/sold)
 * - Delete a pet
 *
 * Used By:
 * api.fixtures.ts, tests/api/* (Petstore CRUD + contract specs)
 *
 * Dependencies:
 * ApiClient, PETSTORE_ENDPOINTS, ApiResponse, NewPet/Pet/PetStatus models
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the Petstore endpoint path builders.
import { PETSTORE_ENDPOINTS } from '@api/endpoints';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the pet domain models (type-only).
import type { NewPet, Pet, PetStatus } from '@models/petstore.model';

/**
 * PetAPI
 *
 * Business-layer service mapping Petstore domain operations onto HTTP calls via
 * the injected ApiClient. SRP: pet semantics here; transport in ApiClient.
 */
// Declare the Petstore pet service.
export class PetAPI {
  /** @param client ApiClient bound to the Petstore base URL. */
  // Inject the ApiClient (bound to the Petstore base URL).
  constructor(private readonly client: ApiClient) {}

  /**
   * Create a pet.
   * @param pet New pet payload.
   * @returns POST /pet response with the created pet.
   */
  // Create a pet (POST /pet).
  public async create(pet: NewPet): Promise<ApiResponse<Pet>> {
    // POST the new pet payload and return the created pet.
    return this.client.post<Pet>(PETSTORE_ENDPOINTS.PET, { data: pet });
  }

  /**
   * Fetch a pet by id.
   * @param id Pet id.
   * @returns GET /pet/:id response with the pet.
   */
  // Fetch a pet by id (GET /pet/:id).
  public async getById(id: number): Promise<ApiResponse<Pet>> {
    // GET the pet at the id-scoped endpoint.
    return this.client.get<Pet>(PETSTORE_ENDPOINTS.PET_BY_ID(id));
  }

  /**
   * Update an existing pet (Petstore PUT /pet carries the id in the body).
   * @param pet Full pet payload including its id.
   * @returns PUT /pet response with the updated pet.
   */
  // Update a pet (PUT /pet; id travels in the body).
  public async update(pet: NewPet): Promise<ApiResponse<Pet>> {
    // PUT the full pet payload and return the updated pet.
    return this.client.put<Pet>(PETSTORE_ENDPOINTS.PET, { data: pet });
  }

  /**
   * Find pets by lifecycle status.
   * @param status One of available/pending/sold.
   * @returns GET /pet/findByStatus response with matching pets.
   */
  // Find pets by lifecycle status (GET /pet/findByStatus?status=...).
  public async findByStatus(status: PetStatus): Promise<ApiResponse<Pet[]>> {
    // GET the find-by-status endpoint, passing the status as a query param.
    return this.client.get<Pet[]>(PETSTORE_ENDPOINTS.PET_FIND_BY_STATUS, {
      // Query parameters carrying the status filter.
      params: { status },
    });
  }

  /**
   * Delete a pet.
   * @param id Pet id.
   * @returns DELETE /pet/:id response.
   */
  // Delete a pet (DELETE /pet/:id).
  public async remove(id: number): Promise<ApiResponse<unknown>> {
    // DELETE the id-scoped pet endpoint.
    return this.client.delete<unknown>(PETSTORE_ENDPOINTS.PET_BY_ID(id));
  }
}
