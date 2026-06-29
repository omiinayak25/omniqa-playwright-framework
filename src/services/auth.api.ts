/**
 * --------------------------------------------------------
 * File: auth.api.ts
 * Module: API Services
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Business service for authentication flows. Issues Restful-Booker tokens
 * (used as a Cookie for write operations) and performs DummyJSON login
 * (Bearer access/refresh tokens).
 *
 * Responsibilities:
 * - Create a Restful-Booker auth token from credentials
 * - Expose a convenience accessor returning just the token string
 * - Perform DummyJSON username/password login
 *
 * Used By:
 * api.fixtures.ts, tests/api/* (auth + write-operation setup)
 *
 * Dependencies:
 * ApiClient, config, RESTFUL_BOOKER_ENDPOINTS/DUMMYJSON_ENDPOINTS,
 * ApiResponse, AuthToken, DummyAuthResponse, UserCredentials models
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 */
// Import the HTTP client type that performs the transport (type-only).
import type { ApiClient } from '@api/clients/api-client';
// Import the config singleton (for default Booker credentials).
import { config } from '@config/config';
// Import the Booker + DummyJSON endpoint path builders.
import { RESTFUL_BOOKER_ENDPOINTS, DUMMYJSON_ENDPOINTS } from '@api/endpoints';
// Import the generic API response envelope (type-only).
import type { ApiResponse } from '@models/api.model';
// Import the Booker auth-token model (type-only).
import type { AuthToken } from '@models/booking.model';
// Import the DummyJSON auth-response model (type-only).
import type { DummyAuthResponse } from '@models/dummyjson.model';
// Import the username/password contract (type-only).
import type { UserCredentials } from '@models/user.model';

/**
 * AuthAPI
 *
 * Business-layer service dedicated to authentication. It owns the knowledge of
 * how each target API issues credentials (Restful-Booker token vs DummyJSON
 * Bearer) so tests and other services can obtain auth without touching that
 * detail. Delegates all transport to injected ApiClient instances (SRP).
 */
// Declare the authentication service.
export class AuthAPI {
  /**
   * @param bookerClient ApiClient bound to the Restful-Booker base URL.
   * @param dummyClient ApiClient bound to the DummyJSON base URL.
   */
  // Inject two ApiClients: one for Restful-Booker, one for DummyJSON.
  constructor(
    // ApiClient bound to the Restful-Booker base URL.
    private readonly bookerClient: ApiClient,
    // ApiClient bound to the DummyJSON base URL.
    private readonly dummyClient: ApiClient,
  ) {}

  /**
   * Create a Restful-Booker auth token.
   *
   * @param credentials Username/password; defaults to configured Booker creds.
   * @returns Response whose body holds the issued token (used as a Cookie on writes).
   */
  // Create a Restful-Booker auth token (POST /auth).
  public async createBookerToken(
    credentials: UserCredentials = config.api.restfulBooker.credentials,
  ): Promise<ApiResponse<AuthToken>> {
    // POST the credentials and return the token response.
    return this.bookerClient.post<AuthToken>(RESTFUL_BOOKER_ENDPOINTS.AUTH, {
      // Body carrying the username/password.
      data: { username: credentials.username, password: credentials.password },
    });
  }

  /**
   * Convenience accessor returning only the Restful-Booker token string.
   *
   * @param credentials Optional credentials; defaults to configured Booker creds.
   * @returns The raw token string for use in a `Cookie: token=<token>` header.
   */
  // Convenience: return just the token string.
  public async getBookerToken(credentials?: UserCredentials): Promise<string> {
    // Create the token response.
    const res = await this.createBookerToken(credentials);
    // Extract and return the token string.
    return res.body.token;
  }

  /**
   * Log in to DummyJSON, returning Bearer access/refresh tokens.
   *
   * @param username DummyJSON username.
   * @param password DummyJSON password.
   * @returns Response whose body contains the Bearer access/refresh tokens.
   */
  // Log in to DummyJSON (POST /auth/login → Bearer tokens).
  public async dummyLogin(
    username: string,
    password: string,
  ): Promise<ApiResponse<DummyAuthResponse>> {
    // POST the credentials to the DummyJSON login endpoint.
    return this.dummyClient.post<DummyAuthResponse>(DUMMYJSON_ENDPOINTS.AUTH_LOGIN, {
      // Body carrying the username/password.
      data: { username, password },
    });
  }
}
