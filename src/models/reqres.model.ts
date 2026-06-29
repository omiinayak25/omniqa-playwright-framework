/**
 * --------------------------------------------------------
 * File: reqres.model.ts
 * Module: Domain Models
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * ReqRes domain models (user, paginated user list, create-user request/response).
 *
 * Responsibilities:
 * - Type the request/response shapes of the ReqRes API.
 *
 * Used By:
 * ReqRes service and its API tests.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * @see https://reqres.in/
 * --------------------------------------------------------
 */

/** A ReqRes user record (id, email, first/last name, avatar URL). */
export interface ReqResUser {
  readonly id: number;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly avatar: string;
}

/** Paginated list of users plus page/total metadata. */
export interface PaginatedUsers {
  readonly page: number;
  readonly per_page: number;
  readonly total: number;
  readonly total_pages: number;
  readonly data: ReqResUser[];
}

/** Payload for creating a user (name and job). */
export interface CreateUserRequest {
  readonly name: string;
  readonly job: string;
}

/** Create-user response: the request fields plus server-assigned id and createdAt. */
export interface CreateUserResponse extends CreateUserRequest {
  readonly id: string;
  readonly createdAt: string;
}
