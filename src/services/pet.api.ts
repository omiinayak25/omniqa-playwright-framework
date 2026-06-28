/**
 * --------------------------------------------------------
 * File: pet.api.ts
 * Module: API Services
 * Project: OMNIQA Playwright Framework
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
import type { ApiClient } from '@api/clients/api-client';
import { PETSTORE_ENDPOINTS } from '@constants/api-endpoints.constants';
import type { ApiResponse } from '@models/api.model';
import type { NewPet, Pet, PetStatus } from '@models/petstore.model';

/**
 * PetAPI
 *
 * Business-layer service mapping Petstore domain operations onto HTTP calls via
 * the injected ApiClient. SRP: pet semantics here; transport in ApiClient.
 */
export class PetAPI {
  /** @param client ApiClient bound to the Petstore base URL. */
  constructor(private readonly client: ApiClient) {}

  /**
   * Create a pet.
   * @param pet New pet payload.
   * @returns POST /pet response with the created pet.
   */
  public async create(pet: NewPet): Promise<ApiResponse<Pet>> {
    return this.client.post<Pet>(PETSTORE_ENDPOINTS.PET, { data: pet });
  }

  /**
   * Fetch a pet by id.
   * @param id Pet id.
   * @returns GET /pet/:id response with the pet.
   */
  public async getById(id: number): Promise<ApiResponse<Pet>> {
    return this.client.get<Pet>(PETSTORE_ENDPOINTS.PET_BY_ID(id));
  }

  /**
   * Update an existing pet (Petstore PUT /pet carries the id in the body).
   * @param pet Full pet payload including its id.
   * @returns PUT /pet response with the updated pet.
   */
  public async update(pet: NewPet): Promise<ApiResponse<Pet>> {
    return this.client.put<Pet>(PETSTORE_ENDPOINTS.PET, { data: pet });
  }

  /**
   * Find pets by lifecycle status.
   * @param status One of available/pending/sold.
   * @returns GET /pet/findByStatus response with matching pets.
   */
  public async findByStatus(status: PetStatus): Promise<ApiResponse<Pet[]>> {
    return this.client.get<Pet[]>(PETSTORE_ENDPOINTS.PET_FIND_BY_STATUS, {
      params: { status },
    });
  }

  /**
   * Delete a pet.
   * @param id Pet id.
   * @returns DELETE /pet/:id response.
   */
  public async remove(id: number): Promise<ApiResponse<unknown>> {
    return this.client.delete<unknown>(PETSTORE_ENDPOINTS.PET_BY_ID(id));
  }
}
