/**
 * --------------------------------------------------------
 * File: api-endpoints.constants.ts
 * Module: Constants
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * API endpoint paths (relative to each service's base URL), grouped per
 * target service. Functions are used where a path segment is dynamic (e.g. id).
 *
 * Responsibilities:
 * - Provide the single source of truth for every API path used in tests.
 *
 * Used By:
 * API services/clients, repositories, and API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Centralized so a vendor route change is a one-line edit here rather than
 * a find-and-replace across dozens of tests.
 * --------------------------------------------------------
 */

/** Restful-Booker endpoint paths (auth, health ping, booking CRUD). */
export const RESTFUL_BOOKER_ENDPOINTS = {
  AUTH: '/auth',
  PING: '/ping',
  BOOKING: '/booking',
  BOOKING_BY_ID: (id: number): string => `/booking/${id}`,
} as const;

/** ReqRes endpoint paths (user listing/lookup, register, login). */
export const REQRES_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: number): string => `/users/${id}`,
  REGISTER: '/register',
  LOGIN: '/login',
} as const;

/** DummyJSON endpoint paths (auth login, product CRUD/search, carts). */
export const DUMMYJSON_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: number): string => `/products/${id}`,
  PRODUCTS_SEARCH: '/products/search',
  CARTS: '/carts',
} as const;

/** JSONPlaceholder endpoint paths (posts, comments, users). */
export const JSONPLACEHOLDER_ENDPOINTS = {
  POSTS: '/posts',
  POST_BY_ID: (id: number): string => `/posts/${id}`,
  COMMENTS: '/comments',
  USERS: '/users',
} as const;

/** Swagger Petstore endpoint paths (pet CRUD/find-by-status, store orders). */
export const PETSTORE_ENDPOINTS = {
  PET: '/pet',
  PET_BY_ID: (id: number): string => `/pet/${id}`,
  PET_FIND_BY_STATUS: '/pet/findByStatus',
  STORE_ORDER: '/store/order',
  STORE_ORDER_BY_ID: (id: number): string => `/store/order/${id}`,
} as const;
