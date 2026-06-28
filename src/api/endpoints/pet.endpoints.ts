/**
 * --------------------------------------------------------
 * File: pet.endpoints.ts
 * Module: API Endpoints
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Swagger Petstore endpoint paths (pet CRUD/find-by-status, store orders).
 *
 * Used By:
 * @services/pet.api.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export const PETSTORE_ENDPOINTS = {
  PET: '/pet',
  PET_BY_ID: (id: number): string => `/pet/${id}`,
  PET_FIND_BY_STATUS: '/pet/findByStatus',
  STORE_ORDER: '/store/order',
  STORE_ORDER_BY_ID: (id: number): string => `/store/order/${id}`,
} as const;
