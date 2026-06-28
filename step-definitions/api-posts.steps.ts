/**
 * --------------------------------------------------------
 * File: api-posts.steps.ts
 * Module: Step Definitions
 * Project: OMNIQA Playwright Framework
 *
 * Feature Under Test: JSONPlaceholder Posts API BDD steps.
 * Business Scenario: Gherkin post scenarios drive the PostAPI service.
 * Test Strategy: BDD glue reusing PostAPI; generic Thens handle status/schema.
 * Priority: Medium
 * Tags: (driven by features/api/posts.feature)
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { postApi } from './support/api.support';
import type { CustomWorld } from '@bdd/world';

/** Minimal shape the post steps read from a single-post response body. */
interface PostBody {
  readonly id: number;
  readonly title: string;
}

const postBody = (world: CustomWorld): PostBody =>
  (world.get('response') as { body: PostBody }).body;

const listBody = (world: CustomWorld): readonly unknown[] =>
  (world.get('response') as { body: readonly unknown[] }).body;

// ------------------------------------------------------------------- actions
When('I request all posts', async function (this: CustomWorld) {
  this.set('response', await postApi(this).listPosts());
});

When('I request post {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await postApi(this).getPost(id));
});

When('I create a post titled {string}', async function (this: CustomWorld, title: string) {
  this.set(
    'response',
    await postApi(this).createPost({ title, body: 'Created by OmniQA BDD', userId: 1 }),
  );
});

When(
  'I update post {int} with title {string}',
  async function (this: CustomWorld, id: number, title: string) {
    this.set(
      'response',
      await postApi(this).updatePost(id, { title, body: 'Updated by OmniQA BDD', userId: 1 }),
    );
  },
);

When('I delete post {int}', async function (this: CustomWorld, id: number) {
  this.set('response', await postApi(this).deletePost(id));
});

// ---------------------------------------------------------------- assertions
Then('the response should contain a non-empty list of posts', function (this: CustomWorld) {
  const list = listBody(this);
  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeGreaterThan(0);
});

Then('the created post should have an id', function (this: CustomWorld) {
  expect(postBody(this).id).toBeTruthy();
});

Then('the post title should be {string}', function (this: CustomWorld, title: string) {
  expect(postBody(this).title).toBe(title);
});
