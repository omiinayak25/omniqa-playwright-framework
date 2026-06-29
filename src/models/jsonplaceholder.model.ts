/**
 * --------------------------------------------------------
 * File: jsonplaceholder.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * JSONPlaceholder domain models (post, new-post payload, and user).
 *
 * Responsibilities:
 * - Type the request/response shapes of the JSONPlaceholder API.
 *
 * Used By:
 * JSONPlaceholder service and its API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * @see https://jsonplaceholder.typicode.com — keyless, always-on fake REST
 * API with reliable CRUD-shaped responses.
 * --------------------------------------------------------
 */

/** A blog post resource (id, owning userId, title, body). */
export interface Post {
  readonly id: number;
  readonly userId: number;
  readonly title: string;
  readonly body: string;
}

/** Payload for creating a post (title, body, owning userId). */
export interface NewPost {
  readonly title: string;
  readonly body: string;
  readonly userId: number;
}

/** A minimal JSONPlaceholder user (id, name, username, email). */
export interface JsonUser {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
}
