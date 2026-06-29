/**
 * --------------------------------------------------------
 * File: support/api.support.ts
 * Module: Step Definitions / Support
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Shared helpers for the API step definitions — one place that builds each
 * domain's service (bound to its base URL via an ApiClient on the scenario's
 * API context) and the name→JSON-schema map used by the generic schema step.
 *
 * Responsibilities:
 * - Factory functions returning ready-to-use API services per scenario.
 * - Inject the ReqRes x-api-key default header for the User service.
 * - Expose a SCHEMAS lookup for contract-validation steps.
 *
 * Used By:
 * step-definitions/api-*.steps.ts, step-definitions/api-common.steps.ts
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Not a step file (no Given/When/Then) — just reusable wiring, loaded by the
 * Cucumber require glob alongside the steps.
 * --------------------------------------------------------
 */
import { ApiClient } from '@api/clients/api-client';
import { CorrelationIdMiddleware, TimingMiddleware } from '@middlewares/index';
import { AuthAPI } from '@services/auth.api';
import { BookingAPI } from '@services/booking.api';
import { ProductAPI } from '@services/product.api';
import { PostAPI } from '@services/post.api';
import { UserAPI } from '@services/user.api';
import { PetAPI } from '@services/pet.api';
import { config } from '@config/config';
import {
  BOOKING_SCHEMA,
  PRODUCT_SCHEMA,
  PRODUCT_LIST_SCHEMA,
  POST_SCHEMA,
  PET_SCHEMA,
} from '@schemas/index';
import type { CustomWorld } from '@bdd/world';

// Every BDD API client runs the cross-cutting middleware chain: a propagated
// correlation-id header + an SLA timing warning.
const client = (
  world: CustomWorld,
  baseUrl: string,
  headers: Record<string, string> = {},
): ApiClient =>
  new ApiClient(world.apiContext, baseUrl, headers, [
    new CorrelationIdMiddleware(),
    new TimingMiddleware(),
  ]);

export const bookingApi = (w: CustomWorld): BookingAPI =>
  new BookingAPI(client(w, config.api.restfulBooker.baseUrl));

export const authApi = (w: CustomWorld): AuthAPI =>
  new AuthAPI(client(w, config.api.restfulBooker.baseUrl), client(w, config.api.dummyJson.baseUrl));

export const productApi = (w: CustomWorld): ProductAPI =>
  new ProductAPI(client(w, config.api.dummyJson.baseUrl));

export const postApi = (w: CustomWorld): PostAPI =>
  new PostAPI(client(w, config.api.jsonPlaceholder.baseUrl));

export const userApi = (w: CustomWorld): UserAPI =>
  new UserAPI(client(w, config.api.reqres.baseUrl, { 'x-api-key': config.api.reqres.apiKey }));

export const petApi = (w: CustomWorld): PetAPI =>
  new PetAPI(client(w, config.api.petStore.baseUrl));

/** Business-readable schema name → JSON Schema, for the generic contract step. */
export const SCHEMAS: Readonly<Record<string, object>> = {
  booking: BOOKING_SCHEMA,
  product: PRODUCT_SCHEMA,
  'product list': PRODUCT_LIST_SCHEMA,
  post: POST_SCHEMA,
  pet: PET_SCHEMA,
};
