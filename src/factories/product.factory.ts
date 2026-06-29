/**
 * --------------------------------------------------------
 * File: product.factory.ts
 * Module: Factories
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Produces DummyJSON {@link NewProduct} datasets — valid, bulk, edge and an
 * invalid case — by composing ProductBuilder.
 *
 * Dependencies:
 * @builders (ProductBuilder), @factories/factory (generate), @models/dummyjson.model.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
import { ProductBuilder } from '@builders/index';
import { generate } from '@factories/factory';
import type { NewProduct } from '@models/dummyjson.model';

/** Dataset factory for {@link NewProduct} payloads (composes ProductBuilder). */
export class ProductFactory {
  /** One valid, randomized product. */
  public static valid(): NewProduct {
    return ProductBuilder.valid().build();
  }

  /** `count` valid, independently-randomized products. */
  public static many(count: number): NewProduct[] {
    return generate(count, () => ProductBuilder.valid().build());
  }

  /** Edge cases: zero price and the title-only minimal payload. */
  public static edgeCases(): NewProduct[] {
    return [ProductBuilder.valid().withZeroPrice().build(), ProductBuilder.titleOnly().build()];
  }

  /** One invalid product (negative price). */
  public static invalid(): NewProduct {
    return ProductBuilder.invalidNegativePrice().build();
  }
}
