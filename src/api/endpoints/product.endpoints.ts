/**
 * --------------------------------------------------------
 * File: product.endpoints.ts
 * Module: API Endpoints
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * DummyJSON endpoint paths (auth login, product CRUD/search, carts).
 *
 * Used By:
 * @services/product.api, @services/auth.api (AUTH_LOGIN).
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export const DUMMYJSON_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: number): string => `/products/${id}`,
  PRODUCTS_SEARCH: '/products/search',
  CARTS: '/carts',
} as const;
