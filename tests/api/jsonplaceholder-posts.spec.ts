/**
 * --------------------------------------------------------
 * File: jsonplaceholder-posts.spec.ts
 * Module: API Tests · Posts (extended)
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: JSONPlaceholder posts/users — list, lookup, CRUD, schema.
 * Business Scenario: A content API must list, fetch, create, update and delete.
 * Preconditions: Network access to JSONPlaceholder.
 * Test Strategy: Collection size + data-driven lookups + CRUD + schema + negative.
 * Expected Outcome: Correct sizes/ids/status codes; valid schema; 404 for misses.
 * Priority: Medium
 * Tags: @api @regression
 *
 * Last Updated: 2026-06-28
 * Notes: Complements posts.spec.ts with size/lookup/schema/negative coverage.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ResponseValidator } from '@api/response-validator';
import { HttpStatus } from '@constants/index';

test.describe('JSONPlaceholder · Posts extended @api @regression', () => {
  test('@smoke the posts collection has 100 items', async ({ postApi }) => {
    const res = await postApi.listPosts();
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body).toHaveLength(100);
  });

  test('the users collection has 10 items', async ({ postApi }) => {
    const res = await postApi.listUsers();
    expect(res.body).toHaveLength(10);
  });

  for (const id of [1, 25, 50, 75, 100] as const) {
    test(`getPost(${id}) returns the matching post`, async ({ postApi }) => {
      const res = await postApi.getPost(id);
      ResponseValidator.for(res).status(HttpStatus.OK);
      expect(res.body.id).toBe(id);
    });
  }

  test('a post has the expected schema', async ({ postApi }) => {
    const res = await postApi.getPost(1);
    expect(typeof res.body.userId).toBe('number');
    expect(typeof res.body.title).toBe('string');
    expect(typeof res.body.body).toBe('string');
  });

  test('an unknown post id returns 404', async ({ postApi }) => {
    const res = await postApi.getPost(99_999);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  test('creating a post returns 201 with an id', async ({ postApi }) => {
    const res = await postApi.createPost({ userId: 1, title: 'QA title', body: 'QA body' });
    ResponseValidator.for(res).status(HttpStatus.CREATED);
    expect(res.body.id).toBeTruthy();
  });

  test('updating a post returns 200 with the new values', async ({ postApi }) => {
    const res = await postApi.updatePost(1, { userId: 1, title: 'Updated', body: 'Updated body' });
    ResponseValidator.for(res).status(HttpStatus.OK);
    expect(res.body.title).toBe('Updated');
  });

  test('deleting a post returns 200', async ({ postApi }) => {
    const res = await postApi.deletePost(1);
    expect(res.status).toBe(HttpStatus.OK);
  });
});
