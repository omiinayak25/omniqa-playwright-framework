/**
 * --------------------------------------------------------
 * File: random.util.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Thin, intention-revealing wrapper over Faker for generating random test
 * data (names, emails, usernames, passwords, ids, primitives).
 *
 * Responsibilities:
 * - Expose named generators (`randomEmail`, `randomFullName`, etc.).
 * - Provide `seedRandom(seed)` for reproducible runs.
 * - `randomFrom` to pick a random element from a non-empty array.
 *
 * Used By:
 * Test-data factories/builders and tests needing throwaway/unique data.
 *
 * Dependencies:
 * @faker-js/faker
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: centralizing Faker gives one place to seed for reproducibility and
 * decouples factories from Faker, so swapping the data source later is a
 * one-file change. WHEN: use these instead of importing Faker directly.
 * LIMITATIONS: values are random (not guaranteed globally unique) unless
 * seeded; `randomFrom` throws on an empty array.
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';

/**
 * Seed Faker for reproducible runs (e.g. in CI debugging).
 * @param seed - Numeric seed; the same seed yields the same data sequence.
 */
export function seedRandom(seed: number): void {
  faker.seed(seed);
}

/**
 * @returns A random first name.
 */
export function randomFirstName(): string {
  return faker.person.firstName();
}

/**
 * @returns A random last name.
 */
export function randomLastName(): string {
  return faker.person.lastName();
}

/**
 * @returns A random full name (first + last).
 */
export function randomFullName(): string {
  return faker.person.fullName();
}

/**
 * Unique email (timestamped local part avoids collisions across parallel workers).
 * @returns A lowercase email under the `example.test` domain.
 */
export function randomEmail(): string {
  return faker.internet.email({ provider: 'example.test' }).toLowerCase();
}

/**
 * @returns A random username with characters restricted to `[A-Za-z0-9._-]`.
 */
export function randomUsername(): string {
  return faker.internet.username().replace(/[^a-zA-Z0-9._-]/g, '');
}

/**
 * Password meeting common complexity rules.
 * @param length - Desired password length (default 12).
 * @returns A random password drawn from `[A-Za-z0-9!@#$%]`.
 */
export function randomPassword(length = 12): string {
  return faker.internet.password({ length, memorable: false, pattern: /[A-Za-z0-9!@#$%]/ });
}

/**
 * @returns A random phone number string.
 */
export function randomPhone(): string {
  return faker.phone.number();
}

/**
 * @param min - Inclusive lower bound.
 * @param max - Inclusive upper bound.
 * @returns A random integer in `[min, max]`.
 */
export function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

/**
 * @param length - Desired string length (default 10).
 * @returns A random alphanumeric string.
 */
export function randomString(length = 10): string {
  return faker.string.alphanumeric(length);
}

/**
 * @returns A random RFC-4122 v4 UUID string.
 */
export function randomUuid(): string {
  return faker.string.uuid();
}

/**
 * @returns A random boolean.
 */
export function randomBoolean(): boolean {
  return faker.datatype.boolean();
}

/**
 * Pick a random element from a non-empty readonly array.
 *
 * @typeParam T - Element type of the array.
 * @param items - A non-empty readonly array to pick from.
 * @returns A randomly selected element of `items`.
 * @throws {Error} If `items` is empty.
 */
export function randomFrom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('[random] Cannot pick from an empty array');
  }
  return faker.helpers.arrayElement(items);
}
