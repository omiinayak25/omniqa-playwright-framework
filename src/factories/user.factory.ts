/**
 * --------------------------------------------------------
 * File: user.factory.ts
 * Module: Factories
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Produces ReqRes {@link CreateUserRequest} datasets. The model is trivial
 * ({name, job}) so there is no UserBuilder — the factory uses faker directly
 * (factories may build simple models; builders are reserved for rich ones).
 *
 * Dependencies:
 * @faker-js/faker, @factories/factory (generate), @models/reqres.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';
import { generate } from '@factories/factory';
import type { CreateUserRequest } from '@models/reqres.model';

/** Dataset factory for {@link CreateUserRequest} payloads. */
export class UserFactory {
  /** One valid, randomized user. */
  public static valid(): CreateUserRequest {
    return { name: faker.person.fullName(), job: faker.person.jobTitle() };
  }

  /** A valid user with a specific job title. */
  public static withJob(job: string): CreateUserRequest {
    return { name: faker.person.fullName(), job };
  }

  /** `count` valid, independently-randomized users. */
  public static many(count: number): CreateUserRequest[] {
    return generate(count, () => UserFactory.valid());
  }

  /** Edge cases: empty name and empty job. */
  public static edgeCases(): CreateUserRequest[] {
    return [
      { name: '', job: faker.person.jobTitle() },
      { name: faker.person.fullName(), job: '' },
    ];
  }
}
