/**
 * --------------------------------------------------------
 * File: user.endpoints.ts
 * Module: API Endpoints
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * ReqRes endpoint paths (user listing/lookup, register, login).
 *
 * Used By:
 * @services/user.api.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export const REQRES_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: number): string => `/users/${id}`,
  REGISTER: '/register',
  LOGIN: '/login',
} as const;
