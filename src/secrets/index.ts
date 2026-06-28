/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Secrets
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Barrel for the secrets package — single import surface.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export {
  getSecrets,
  EnvSecretProvider,
  VaultSecretProvider,
  type SecretProvider,
} from '@secrets/secret-provider';
