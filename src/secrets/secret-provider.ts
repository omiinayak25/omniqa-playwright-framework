/**
 * --------------------------------------------------------
 * File: secret-provider.ts
 * Module: Secrets
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 * Pluggable secret-resolution abstraction so secrets come from a single typed
 * surface regardless of source (environment today; HashiCorp Vault / Azure Key
 * Vault / AWS Secrets Manager later — implement the same interface).
 *
 * Responsibilities:
 * - Define the SecretProvider contract.
 * - EnvSecretProvider: resolve from process.env (the default).
 * - VaultSecretProvider: resolve from an AES-256-GCM encrypted JSON file
 *   (decrypted via @utils/crypto), cached after first read.
 * - getSecrets(): return the provider configured by env.
 *
 * Used By:
 * Any layer needing a secret (replaces scattered process.env reads); test
 * setup / API auth.
 *
 * Dependencies:
 * node:fs, @utils/crypto (decrypt), @config/env (getEnvOptional).
 *
 * Last Updated: 2026-06-28
 * Notes:
 * The vault file stores ONE encrypt()-ed JSON object of key→secret; it is safe
 * to commit (ciphertext) because the ENCRYPTION_SECRET passphrase lives only in
 * CI secrets / the local environment. Swap in a real KMS by implementing
 * SecretProvider — call sites never change (Dependency Inversion).
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import { decrypt } from '@utils/crypto.util';
import { getEnvOptional } from '@config/env';

/** The contract every secret source implements. */
export interface SecretProvider {
  /** Resolve a secret by key, or throw if it is absent. */
  get(key: string): string;
  /** Resolve a secret by key, or return the fallback when absent. */
  getOptional(key: string, fallback: string): string;
  /** Whether a secret exists for the key. */
  has(key: string): boolean;
}

/** Default provider — resolves secrets from environment variables. */
export class EnvSecretProvider implements SecretProvider {
  public get(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      throw new Error(`[secrets] Missing required secret: "${key}"`);
    }
    return value;
  }

  public getOptional(key: string, fallback: string): string {
    return getEnvOptional(key, fallback);
  }

  public has(key: string): boolean {
    const value = process.env[key];
    return value !== undefined && value !== '';
  }
}

/**
 * Encrypted-file provider — decrypts a committed AES-256-GCM vault file once,
 * then serves secrets from memory.
 */
export class VaultSecretProvider implements SecretProvider {
  private readonly vaultPath: string;
  private cache: Readonly<Record<string, string>> | undefined;

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
  }

  public get(key: string): string {
    const value = this.load()[key];
    if (value === undefined) {
      throw new Error(`[secrets] Missing required secret in vault: "${key}"`);
    }
    return value;
  }

  public getOptional(key: string, fallback: string): string {
    return this.load()[key] ?? fallback;
  }

  public has(key: string): boolean {
    return this.load()[key] !== undefined;
  }

  /** Lazily decrypt + parse the vault, caching the result. */
  private load(): Readonly<Record<string, string>> {
    if (this.cache === undefined) {
      const ciphertext = fs.readFileSync(this.vaultPath, 'utf-8').trim();
      this.cache = JSON.parse(decrypt(ciphertext)) as Record<string, string>;
    }
    return this.cache;
  }
}

let cached: SecretProvider | undefined;

/**
 * Purpose: Return the configured secret provider (process-wide singleton).
 * Uses the encrypted vault when SECRETS_VAULT_FILE is set, else the env source.
 * @returns The active {@link SecretProvider}.
 */
export function getSecrets(): SecretProvider {
  if (cached === undefined) {
    const vaultPath = getEnvOptional('SECRETS_VAULT_FILE', '');
    cached = vaultPath !== '' ? new VaultSecretProvider(vaultPath) : new EnvSecretProvider();
  }
  return cached;
}
