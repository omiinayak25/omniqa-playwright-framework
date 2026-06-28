/**
 * --------------------------------------------------------
 * File: checkout.builder.ts
 * Module: Builders
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Fluent builder for SauceDemo {@link CheckoutInfo} — valid randomized customer
 * details plus the exact missing-field variants the checkout validation
 * scenarios need (no first/last name, no postal code).
 *
 * Responsibilities:
 * - Seed valid, randomized checkout information.
 * - Offer chainable mutators and named missing-field (invalid) variants.
 *
 * Used By:
 * @factories/* and checkout UI/BDD scenarios (replaces inline literals).
 *
 * Dependencies:
 * @faker-js/faker, @builders/builder (AbstractBuilder), @models/user.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';
import { AbstractBuilder } from '@builders/builder';
import type { CheckoutInfo } from '@models/user.model';

/**
 * Builds {@link CheckoutInfo} for the checkout form. Entry: {@link CheckoutBuilder.valid}.
 * @example CheckoutBuilder.valid().withPostalCode('560001').build();
 */
export class CheckoutBuilder extends AbstractBuilder<CheckoutInfo> {
  private constructor(seed: CheckoutInfo) {
    super(seed);
  }

  /** Valid, randomized checkout details. */
  public static valid(): CheckoutBuilder {
    return new CheckoutBuilder({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      postalCode: faker.location.zipCode(),
    });
  }

  public withFirstName(firstName: string): this {
    return this.with({ firstName });
  }

  public withLastName(lastName: string): this {
    return this.with({ lastName });
  }

  public withPostalCode(postalCode: string): this {
    return this.with({ postalCode });
  }

  /** Invalid: missing first name (triggers "First Name is required"). */
  public static missingFirstName(): CheckoutBuilder {
    return CheckoutBuilder.valid().with({ firstName: '' });
  }

  /** Invalid: missing last name (triggers "Last Name is required"). */
  public static missingLastName(): CheckoutBuilder {
    return CheckoutBuilder.valid().with({ lastName: '' });
  }

  /** Invalid: missing postal code (triggers "Postal Code is required"). */
  public static missingPostalCode(): CheckoutBuilder {
    return CheckoutBuilder.valid().with({ postalCode: '' });
  }
}
