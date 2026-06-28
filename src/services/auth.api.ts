/**
 * --------------------------------------------------------
 * File: auth.api.ts
 * Module: API Services
 * Project: OMNIQA Playwright Framework
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
import type { ApiClient } from '@api/clients/api-client';
import { config } from '@config/config';
import { RESTFUL_BOOKER_ENDPOINTS, DUMMYJSON_ENDPOINTS } from '@constants/api-endpoints.constants';
import type { ApiResponse } from '@models/api.model';
import type { AuthToken } from '@models/booking.model';
import type { DummyAuthResponse } from '@models/dummyjson.model';
import type { UserCredentials } from '@models/user.model';

/**
 * AuthAPI
 *
 * Business-layer service dedicated to authentication. It owns the knowledge of
 * how each target API issues credentials (Restful-Booker token vs DummyJSON
 * Bearer) so tests and other services can obtain auth without touching that
 * detail. Delegates all transport to injected ApiClient instances (SRP).
 */
export class AuthAPI {
  /**
   * @param bookerClient ApiClient bound to the Restful-Booker base URL.
   * @param dummyClient ApiClient bound to the DummyJSON base URL.
   */
  constructor(
    private readonly bookerClient: ApiClient,
    private readonly dummyClient: ApiClient,
  ) {}

  /**
   * Create a Restful-Booker auth token.
   *
   * @param credentials Username/password; defaults to configured Booker creds.
   * @returns Response whose body holds the issued token (used as a Cookie on writes).
   */
  public async createBookerToken(
    credentials: UserCredentials = config.api.restfulBooker.credentials,
  ): Promise<ApiResponse<AuthToken>> {
    return this.bookerClient.post<AuthToken>(RESTFUL_BOOKER_ENDPOINTS.AUTH, {
      data: { username: credentials.username, password: credentials.password },
    });
  }

  /**
   * Convenience accessor returning only the Restful-Booker token string.
   *
   * @param credentials Optional credentials; defaults to configured Booker creds.
   * @returns The raw token string for use in a `Cookie: token=<token>` header.
   */
  public async getBookerToken(credentials?: UserCredentials): Promise<string> {
    const res = await this.createBookerToken(credentials);
    return res.body.token;
  }

  /**
   * Log in to DummyJSON, returning Bearer access/refresh tokens.
   *
   * @param username DummyJSON username.
   * @param password DummyJSON password.
   * @returns Response whose body contains the Bearer access/refresh tokens.
   */
  public async dummyLogin(
    username: string,
    password: string,
  ): Promise<ApiResponse<DummyAuthResponse>> {
    return this.dummyClient.post<DummyAuthResponse>(DUMMYJSON_ENDPOINTS.AUTH_LOGIN, {
      data: { username, password },
    });
  }
}
