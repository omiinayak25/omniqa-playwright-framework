/**
 * --------------------------------------------------------
 * File: product.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
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
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the DummyJSON endpoint path builders.
import { DUMMYJSON_ENDPOINTS } from '@api/endpoints';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the DummyJSON product domain models (type-only).
import type { DummyProduct, NewProduct, ProductList } from '@models/dummyjson.model';

/**
 * ProductAPI
 *
 * Business-layer service mapping DummyJSON product operations onto HTTP calls
 * via the injected ApiClient. SRP: product semantics here; transport in ApiClient.
 */
// Declare the DummyJSON product service.
export class ProductAPI {
  /** @param client ApiClient bound to the DummyJSON base URL. */
  // Inject the ApiClient (bound to the DummyJSON base URL).
  constructor(private readonly client: ApiClient) {}

  /**
   * List products with pagination.
   * @param limit Page size (default 30).
   * @param skip Number of records to skip (default 0).
   * @returns GET /products response with the paginated product list.
   */
  // List products with pagination (GET /products?limit=&skip=).
  public async list(limit = 30, skip = 0): Promise<ApiResponse<ProductList>> {
    // GET the products endpoint with limit/skip query params.
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS, { params: { limit, skip } });
  }

  /**
   * Fetch a single product.
   * @param id Product id.
   * @returns GET /products/:id response with the product.
   */
  // Fetch a single product (GET /products/:id).
  public async getById(id: number): Promise<ApiResponse<DummyProduct>> {
    // GET the id-scoped product endpoint.
    return this.client.get<DummyProduct>(DUMMYJSON_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  /**
   * List products with server-side sorting.
   * @param sortBy Product field to sort on.
   * @param order Sort direction, ascending or descending.
   * @param limit Page size (default 10).
   * @returns GET /products response sorted by the given field.
   */
  // List products with server-side sorting (GET /products?sortBy=&order=&limit=).
  public async listSorted(
    sortBy: keyof DummyProduct,
    order: 'asc' | 'desc',
    limit = 10,
  ): Promise<ApiResponse<ProductList>> {
    // GET the products endpoint with sort + limit query params.
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS, {
      // Query params carrying the sort field, direction, and page size.
      params: { sortBy, order, limit },
    });
  }

  /**
   * Search products by query term.
   * @param query Free-text search term sent as `q`.
   * @returns GET /products/search response with matching products.
   */
  // Search products by term (GET /products/search?q=).
  public async search(query: string): Promise<ApiResponse<ProductList>> {
    // GET the search endpoint, passing the term as `q`.
    return this.client.get<ProductList>(DUMMYJSON_ENDPOINTS.PRODUCTS_SEARCH, {
      // Query param carrying the search term.
      params: { q: query },
    });
  }

  /**
   * Add a product.
   * @param product New product payload.
   * @returns POST /products/add response with the created product.
   */
  // Add a product (POST /products/add).
  public async add(product: NewProduct): Promise<ApiResponse<DummyProduct>> {
    // POST the new product payload to the /add endpoint.
    return this.client.post<DummyProduct>(`${DUMMYJSON_ENDPOINTS.PRODUCTS}/add`, { data: product });
  }
}
