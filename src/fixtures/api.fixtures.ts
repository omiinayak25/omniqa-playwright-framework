/**
 * --------------------------------------------------------
 * File: api.fixtures.ts
 * Module: Fixtures (DI)
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Third link in the fixture chain — injects ready-to-use API service classes
 * (Auth/Booking/User/Product/Post/Pet) backed by a shared HTTP context.
 *
 * Responsibilities:
 * - Provide a WORKER-scoped APIRequestContext (one HTTP context per worker).
 * - Provide TEST-scoped service fixtures, each wired to its target base URL
 *   via an ApiClient over that worker's shared context.
 *
 * Used By:
 * db.fixtures.ts (extends this), and all API specs via @fixtures/index.
 *
 * Dependencies:
 * @fixtures/page.fixtures (chain parent), @playwright/test (request),
 * @api/clients/api-client, @services/*, @config/config, @constants/http.constants.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * The APIRequestContext is WORKER-scoped (one HTTP context per worker, reused
 * across that worker's tests, disposed at worker teardown). Service instances
 * are TEST-scoped but cheap to construct.
 * --------------------------------------------------------
 *
 * FIXTURE FLOW: base.fixtures → page.fixtures → api.fixtures (here) → db.fixtures
 */
import { test as base } from '@fixtures/page.fixtures';
import { request, type APIRequestContext } from '@playwright/test';
import { ApiClient } from '@api/clients/api-client';
import { AuthAPI } from '@services/auth.api';
import { BookingAPI } from '@services/booking.api';
import { UserAPI } from '@services/user.api';
import { ProductAPI } from '@services/product.api';
import { PostAPI } from '@services/post.api';
import { PetAPI } from '@services/pet.api';
import { config } from '@config/config';
import { HEADERS } from '@constants/http.constants';

interface ApiWorkerFixtures {
  readonly apiContext: APIRequestContext;
}

interface ApiServiceFixtures {
  readonly authApi: AuthAPI;
  readonly bookingApi: BookingAPI;
  readonly userApi: UserAPI;
  readonly productApi: ProductAPI;
  readonly postApi: PostAPI;
  readonly petApi: PetAPI;
}

export const test = base.extend<ApiServiceFixtures, ApiWorkerFixtures>({
  // One HTTP context per worker; disposed at worker teardown.
  apiContext: [
    async ({}, use) => {
      const context = await request.newContext({ ignoreHTTPSErrors: true });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  authApi: async ({ apiContext }, use) => {
    const booker = new ApiClient(apiContext, config.api.restfulBooker.baseUrl);
    const dummy = new ApiClient(apiContext, config.api.dummyJson.baseUrl);
    await use(new AuthAPI(booker, dummy));
  },

  bookingApi: async ({ apiContext }, use) => {
    await use(new BookingAPI(new ApiClient(apiContext, config.api.restfulBooker.baseUrl)));
  },

  userApi: async ({ apiContext }, use) => {
    const client = new ApiClient(apiContext, config.api.reqres.baseUrl, {
      [HEADERS.API_KEY]: config.api.reqres.apiKey,
    });
    await use(new UserAPI(client));
  },

  productApi: async ({ apiContext }, use) => {
    await use(new ProductAPI(new ApiClient(apiContext, config.api.dummyJson.baseUrl)));
  },

  postApi: async ({ apiContext }, use) => {
    await use(new PostAPI(new ApiClient(apiContext, config.api.jsonPlaceholder.baseUrl)));
  },

  petApi: async ({ apiContext }, use) => {
    await use(new PetAPI(new ApiClient(apiContext, config.api.petStore.baseUrl)));
  },
});

export { expect } from '@fixtures/base.fixtures';
