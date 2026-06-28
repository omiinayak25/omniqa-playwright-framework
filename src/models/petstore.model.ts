/**
 * --------------------------------------------------------
 * File: petstore.model.ts
 * Module: Domain Models
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Swagger Petstore domain models (pet status enum, category, pet, new-pet
 * payload).
 *
 * Responsibilities:
 * - Type the request/response shapes of the Swagger Petstore API.
 *
 * Used By:
 * Petstore service and its API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * @see https://petstore.swagger.io/v2
 * --------------------------------------------------------
 */

/** Lifecycle status of a pet in the store inventory. */
export enum PetStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  SOLD = 'sold',
}

/** A pet category reference (id and name). */
export interface PetCategory {
  readonly id: number;
  readonly name: string;
}

/** A full pet record (id, name, status, photos, optional category/tags). */
export interface Pet {
  readonly id: number;
  readonly name: string;
  readonly status: PetStatus;
  readonly photoUrls: string[];
  readonly category?: PetCategory;
  readonly tags?: ReadonlyArray<{ id: number; name: string }>;
}

/** Minimal payload for creating a pet (id, name, status, photo URLs). */
export interface NewPet {
  readonly id: number;
  readonly name: string;
  readonly status: PetStatus;
  readonly photoUrls: string[];
}
