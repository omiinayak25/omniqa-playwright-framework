/**
 * --------------------------------------------------------
 * File: post.endpoints.ts
 * Module: API Endpoints
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * JSONPlaceholder endpoint paths (posts, comments, users).
 *
 * Used By:
 * @services/post.api.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export const JSONPLACEHOLDER_ENDPOINTS = {
  POSTS: '/posts',
  POST_BY_ID: (id: number): string => `/posts/${id}`,
  COMMENTS: '/comments',
  USERS: '/users',
} as const;
