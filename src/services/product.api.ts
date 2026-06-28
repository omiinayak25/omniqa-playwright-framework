/**
 * --------------------------------------------------------
 * File: product.api.ts
 * Module: API Services
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Business service for the DummyJSON products resource. Demonstrates
 * pagination, server-side sorting, search, and creation.
 *
 * Responsibilities:
 * - List products with pagination (limit/skip)
 * - Get a product by id
 * - List products with server-side sorting
 * - Search products by query term
 * - Add a product
 *
 * Used By:
 * api.fixtures.ts, tests/api/* (DummyJSON product CRUD + contract specs)
 *
 * Dependencies:
 * ApiClient, DUMMYJSON_ENDPOINTS, ApiResponse,
 * DummyProduct/NewProduct/ProductList models
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
import type { ApiClient } from '@api/clients/api-client';
import { DUMMYJSON_ENDPOINTS } from '@api/endpoints';
import type { ApiResponse } from '@models/api.model';
import type { DummyProduct, NewProduct, ProductList } from '@models/dummyjson.model';

/**
 * ProductAPI
 *
 * Business-layer service mapping DummyJSON product operations onto HTTP calls
 * via the injected ApiClient. SRP: product semantics here; transport in ApiClient.
 */
export class ProductAPI {
  /** @param client ApiClient bound to the DummyJSON base URL. */
  constructor(private readonly client: ApiClient) {}

  /**
   * List products with pagination.
   * @param limit Page size (default 30).
   * @param skip Number of records to skip (default 0).
   * @returns GET /products response with the paginated product list.
   */
  public async list(limit = 30, skip = 0): Promise<ApiResponse<ProductList>> {
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS, { params: { limit, skip } });
  }

  /**
   * Fetch a single product.
   * @param id Product id.
   * @returns GET /products/:id response with the product.
   */
  public async getById(id: number): Promise<ApiResponse<DummyProduct>> {
    return this.client.get<DummyProduct>(DUMMYJSON_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  /**
   * List products with server-side sorting.
   * @param sortBy Product field to sort on.
   * @param order Sort direction, ascending or descending.
   * @param limit Page size (default 10).
   * @returns GET /products response sorted by the given field.
   */
  public async listSorted(
    sortBy: keyof DummyProduct,
    order: 'asc' | 'desc',
    limit = 10,
  ): Promise<ApiResponse<ProductList>> {
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS, {
      params: { sortBy, order, limit },
    });
  }

  /**
   * Search products by query term.
   * @param query Free-text search term sent as `q`.
   * @returns GET /products/search response with matching products.
   */
  public async search(query: string): Promise<ApiResponse<ProductList>> {
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS_SEARCH, {
      params: { q: query },
    });
  }

  /**
   * Add a product.
   * @param product New product payload.
   * @returns POST /products/add response with the created product.
   */
  public async add(product: NewProduct): Promise<ApiResponse<DummyProduct>> {
    return this.client.post<DummyProduct>(`${DUMMYJSON_ENDPOINTS.PRODUCTS}/add`, { data: product });
  }
}
