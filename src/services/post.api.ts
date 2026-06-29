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
import type { ApiClient } from '@api/clients/api-client';
import { JSONPLACEHOLDER_ENDPOINTS } from '@api/endpoints';
import type { ApiResponse } from '@models/api.model';
import type { JsonUser, NewPost, Post } from '@models/jsonplaceholder.model';

/**
 * PostAPI
 *
 * Business-layer service mapping JSONPlaceholder post/user operations onto HTTP
 * calls via the injected ApiClient. SRP: resource semantics here; transport in
 * ApiClient.
 */
export class PostAPI {
  /** @param client ApiClient bound to the JSONPlaceholder base URL. */
  constructor(private readonly client: ApiClient) {}

  /**
   * List all posts.
   * @returns GET /posts response with the array of posts.
   */
  public async listPosts(): Promise<ApiResponse<Post[]>> {
    return this.client.get<Post[]>(JSONPLACEHOLDER_ENDPOINTS.POSTS);
  }

  /**
   * Fetch a single post.
   * @param id Post id.
   * @returns GET /posts/:id response with the post.
   */
  public async getPost(id: number): Promise<ApiResponse<Post>> {
    return this.client.get<Post>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id));
  }

  /**
   * Create a post.
   * @param payload New post payload.
   * @returns POST /posts response with the created post.
   */
  public async createPost(payload: NewPost): Promise<ApiResponse<Post>> {
    return this.client.post<Post>(JSONPLACEHOLDER_ENDPOINTS.POSTS, { data: payload });
  }

  /**
   * Replace an existing post.
   * @param id Post id.
   * @param payload Updated post payload.
   * @returns PUT /posts/:id response with the updated post.
   */
  public async updatePost(id: number, payload: NewPost): Promise<ApiResponse<Post>> {
    return this.client.put<Post>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id), { data: payload });
  }

  /**
   * Delete a post.
   * @param id Post id.
   * @returns DELETE /posts/:id response.
   */
  public async deletePost(id: number): Promise<ApiResponse<unknown>> {
    return this.client.delete<unknown>(JSONPLACEHOLDER_ENDPOINTS.POST_BY_ID(id));
  }

  /**
   * List all users.
   * @returns GET /users response with the array of users.
   */
  public async listUsers(): Promise<ApiResponse<JsonUser[]>> {
    return this.client.get<JsonUser[]>(JSONPLACEHOLDER_ENDPOINTS.USERS);
  }
}
