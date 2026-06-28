/**
 * --------------------------------------------------------
 * File: product.builder.ts
 * Module: Builders
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Fluent builder for DummyJSON {@link NewProduct} payloads — valid randomized
 * defaults plus boundary/invalid variants (zero/negative price, title-only) for
 * the product create/boundary API tests.
 *
 * Responsibilities:
 * - Seed a valid, randomized product (title, price, category).
 * - Offer chainable mutators and boundary/invalid variants.
 *
 * Used By:
 * @factories/product.factory; product API specs / BDD steps.
 *
 * Dependencies:
 * @faker-js/faker, @builders/builder (AbstractBuilder), @models/dummyjson.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { faker } from '@faker-js/faker';
import { AbstractBuilder } from '@builders/builder';
import type { NewProduct } from '@models/dummyjson.model';

/**
 * Builds {@link NewProduct} payloads. Entry point: {@link ProductBuilder.valid}.
 * @example ProductBuilder.valid().withPrice(9.99).build();
 */
export class ProductBuilder extends AbstractBuilder<NewProduct> {
  private constructor(seed: NewProduct) {
    super(seed);
  }

  /** A valid, randomized product. */
  public static valid(): ProductBuilder {
    return new ProductBuilder({
      title: faker.commerce.productName(),
      price: Number(faker.commerce.price({ min: 1, max: 1_000 })),
      category: faker.commerce.department(),
    });
  }

  public withTitle(title: string): this {
    return this.with({ title });
  }

  public withPrice(price: number): this {
    return this.with({ price });
  }

  public withCategory(category: string): this {
    return this.with({ category });
  }

  /** Boundary: a zero price (lowest non-negative value). */
  public withZeroPrice(): this {
    return this.with({ price: 0 });
  }

  /** Invalid: a negative price (business-rule violation). */
  public static invalidNegativePrice(): ProductBuilder {
    return ProductBuilder.valid().with({ price: -1 });
  }

  /** Edge: only the required title, omitting the optional fields. */
  public static titleOnly(): ProductBuilder {
    return new ProductBuilder({ title: faker.commerce.productName() });
  }
}
