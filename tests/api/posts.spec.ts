/**
 * --------------------------------------------------------
 * File: posts.spec.ts
 * Module: API Tests
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: JSONPlaceholder Post + User API (keyless CRUD).
 * Business Scenario: Consumers can list, fetch, create, update, and delete posts.
 * Preconditions: Network access to JSONPlaceholder; no API key required.
 * Test Strategy: CRUD lifecycle + list/count assertions.
 * Expected Outcome: Endpoints return expected status codes and seeded counts.
 * Priority: High
 * Tags: @api @smoke
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * JSONPlaceholder Post API — keyless CRUD, pagination-ish list, negative.
 * Reliable replacement coverage for User CRUD (ReqRes now needs a key).
 * Tagged @api.
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

test.describe('JSONPlaceholder · Post API @api', () => {
  test('@smoke lists posts', async ({ postApi }) => {
    const res = await postApi.listPosts();
    ResponseValidator.for(res).status(HttpStatus.OK).maxTime(5000);
    expect(res.body).toHaveLength(100);
  });

  test('@smoke create → returns 201 with id (CRUD)', async ({ postApi, data }) => {
    const res = await postApi.createPost({
      title: `QA ${data.uuid().slice(0, 8)}`,
      body: 'automated',
      userId: 1,
    });
    ResponseValidator.for(res).status(HttpStatus.CREATED);
    expect(res.body.id).toBeGreaterThan(0);
  });

  test('get a single post by id', async ({ postApi }) => {
    const res = await postApi.getPost(1);
    ResponseValidator.for(res).ok();
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBeTruthy();
  });

  test('update a post (PUT 200)', async ({ postApi }) => {
    const res = await postApi.updatePost(1, { title: 'updated', body: 'updated', userId: 1 });
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.title).toBe('updated');
  });

  test('delete a post (200)', async ({ postApi }) => {
    const res = await postApi.deletePost(1);
    expect(res.status).toBe(HttpStatus.OK);
  });

  test('lists users (10 seeded)', async ({ postApi }) => {
    const res = await postApi.listUsers();
    ResponseValidator.for(res).ok();
    expect(res.body).toHaveLength(10);
  });
});
