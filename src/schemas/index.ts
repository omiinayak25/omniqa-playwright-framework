/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: JSON Schemas
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Central barrel of JSON Schemas for contract testing (AJV). Re-exports the
 * booking schemas and defines the product, post, and pet schemas so the
 * contract suite and individual specs share one source of truth.
 *
 * Responsibilities:
 * - Re-export BOOKING_SCHEMA / CREATED_BOOKING_SCHEMA
 * - Define PRODUCT_SCHEMA / PRODUCT_LIST_SCHEMA (DummyJSON)
 * - Define POST_SCHEMA (JSONPlaceholder)
 * - Define PET_SCHEMA (Petstore)
 *
 * Used By:
 * ResponseValidator.matchesSchema(), tests/api/* contract suites
 *
 * Dependencies:
 * @schemas/booking.schema (re-exported); consumed by AJV via validateSchema
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Schemas are declared `as const` for readonly, type-narrowed literals.
 * --------------------------------------------------------
 */
export { BOOKING_SCHEMA, CREATED_BOOKING_SCHEMA } from '@schemas/booking.schema';

export const PRODUCT_SCHEMA = {
  type: 'object',
  required: ['id', 'title', 'price', 'category', 'stock'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' },
    stock: { type: 'integer' },
    rating: { type: 'number' },
  },
} as const;

export const PRODUCT_LIST_SCHEMA = {
  type: 'object',
  required: ['products', 'total', 'skip', 'limit'],
  properties: {
    products: { type: 'array', items: PRODUCT_SCHEMA },
    total: { type: 'integer' },
    skip: { type: 'integer' },
    limit: { type: 'integer' },
  },
} as const;

export const POST_SCHEMA = {
  type: 'object',
  required: ['id', 'userId', 'title', 'body'],
  properties: {
    id: { type: 'integer' },
    userId: { type: 'integer' },
    title: { type: 'string' },
    body: { type: 'string' },
  },
} as const;

export const PET_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'status'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    status: { type: 'string', enum: ['available', 'pending', 'sold'] },
    photoUrls: { type: 'array', items: { type: 'string' } },
  },
} as const;
