/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: API Endpoints
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel export for domain-specific API endpoint modules (`@api/endpoints`).
 * Single import surface for every service's route definitions.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export { RESTFUL_BOOKER_ENDPOINTS } from '@api/endpoints/booking.endpoints';
export { REQRES_ENDPOINTS } from '@api/endpoints/user.endpoints';
export { DUMMYJSON_ENDPOINTS } from '@api/endpoints/product.endpoints';
export { JSONPLACEHOLDER_ENDPOINTS } from '@api/endpoints/post.endpoints';
export { PETSTORE_ENDPOINTS } from '@api/endpoints/pet.endpoints';
