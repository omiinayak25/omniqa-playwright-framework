/**
 * --------------------------------------------------------
 * File: post.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Business service for JSONPlaceholder posts and users — a keyless, reliable
 * CRUD resource used as the dependable Post/User backend for E2E flows.
 *
 * Responsibilities:
 * - List / get / create / update / delete posts
 * - List users
 *
 * Used By:
 * api.fixtures.ts, tests/api/*, E2E specs (Phase 12 User/Post flows)
 *
 * Dependencies:
 * ApiClient, JSONPLACEHOLDER_ENDPOINTS, ApiResponse,
 * JsonUser/NewPost/Post models
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the JSONPlaceholder endpoint path builders.
import { JSONPLACEHOLDER_ENDPOINTS } from '@api/endpoints';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the JSONPlaceholder domain models (type-only).
import type { JsonUser, NewPost, Post } from '@models/jsonplaceholder.model';

/**
 * PostAPI
 *
 * Business-layer service mapping JSONPlaceholder post/user operations onto HTTP
 * calls via the injected ApiClient. SRP: resource semantics here; transport in
 * ApiClient.
 */
// Declare the JSONPlaceholder post/user service.
export class PostAPI {
  /** @param client ApiClient bound to the JSONPlaceholder base URL. */
  // Inject the ApiClient (bound to the JSONPlaceholder base URL).
  constructor(private readonly client: ApiClient) {}

  /**
   * List all posts.
   * @returns GET /posts response with the array of posts.
   */
  // List all posts (GET /posts).
  public async listPosts(): Promise<ApiResponse<Post[]>> {
    // GET the posts collection.
    return this.client.get<Post[]>(JSONPLACEHOLDER_ENDPOINTS.POSTS);
  }

  /**
   * Fetch a single post.
   * @param id Post id.
   * @returns GET /posts/:id response with the post.
   */
  // Fetch a single post (GET /posts/:id).
  public async getPost(id: number): Promise<ApiResponse<Post>> {
    // GET the id-scoped post endpoint.
    return this.client.get<Post>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id));
  }

  /**
   * Create a post.
   * @param payload New post payload.
   * @returns POST /posts response with the created post.
   */
  // Create a post (POST /posts).
  public async createPost(payload: NewPost): Promise<ApiResponse<Post>> {
    // POST the new post payload.
    return this.client.post<Post>(JSONPLACEHOLDER_ENDPOINTS.POSTS, { data: payload });
  }

  /**
   * Replace an existing post.
   * @param id Post id.
   * @param payload Updated post payload.
   * @returns PUT /posts/:id response with the updated post.
   */
  // Replace a post (PUT /posts/:id).
  public async updatePost(id: number, payload: NewPost): Promise<ApiResponse<Post>> {
    // PUT the updated payload to the id-scoped endpoint.
    return this.client.put<Post>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id), { data: payload });
  }

  /**
   * Delete a post.
   * @param id Post id.
   * @returns DELETE /posts/:id response.
   */
  // Delete a post (DELETE /posts/:id).
  public async deletePost(id: number): Promise<ApiResponse<unknown>> {
    // DELETE the id-scoped post endpoint.
    return this.client.delete<unknown>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id));
  }

  /**
   * List all users.
   * @returns GET /users response with the array of users.
   */
  // List all users (GET /users).
  public async listUsers(): Promise<ApiResponse<JsonUser[]>> {
    // GET the users collection.
    return this.client.get<JsonUser[]>(JSONPLACEHOLDER_ENDPOINTS.USERS);
  }
}
