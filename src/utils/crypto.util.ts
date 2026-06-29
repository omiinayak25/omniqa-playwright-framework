/**
 * --------------------------------------------------------
 * File: crypto.util.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Encryption / decryption / hashing / encoding helpers built on Node's
 * `crypto`, using AES-256-GCM authenticated encryption.
 *
 * Responsibilities:
 * - `encrypt`/`decrypt` round-trip sensitive test data (tamper-detected).
 * - `sha256` one-way fingerprinting; `toBase64`/`fromBase64` encoding.
 * - `maskSecret` for safe logging of secrets.
 *
 * Used By:
 * Secure handling of sensitive test data at rest, masking secrets in logs.
 *
 * Dependencies:
 * node:crypto, @config/env
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: AES-256-GCM provides confidentiality AND integrity (auth tag), so
 * tampering is detected on decrypt; the key is DERIVED from a passphrase
 * (ENCRYPTION_SECRET) via scrypt so the raw key never sits in env.
 * WHEN: encrypt sensitive fixtures, mask secrets before logging.
 * LIMITATIONS: a static salt is used (acceptable only for a derived test
 * key, not production secrets); `sha256` is for comparison/fingerprinting,
 * NOT password storage. NEVER commit a real secret — see .env.example.
 * --------------------------------------------------------
 */
import * as crypto from 'node:crypto';
import { getEnvOptional } from '@config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce recommended for GCM
const KEY_LENGTH = 32; // 256-bit key
const SALT = 'enterprise-pw-framework-salt'; // static salt is fine for a derived test key

/**
 * Derive the 256-bit AES key from the ENCRYPTION_SECRET passphrase.
 * scrypt is a deliberately slow, memory-hard KDF — it turns a human
 * passphrase into a strong key without storing the raw key in env.
 */
function deriveKey(): Buffer {
  const secret = getEnvOptional('ENCRYPTION_SECRET', 'change-me-in-ci');
  return crypto.scryptSync(secret, SALT, KEY_LENGTH);
}

/**
 * Encrypt plaintext. Output format: `iv:authTag:ciphertext` (all base64).
 *
 * @param plaintext - UTF-8 string to encrypt.
 * @returns A base64 `iv:authTag:ciphertext` string consumable by `decrypt`.
 * @example
 *   const token = encrypt('super-secret');
 *   const original = decrypt(token); // 'super-secret'
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH); // fresh random nonce per message
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // GCM integrity tag — verified on decrypt
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(
    ':',
  );
}

/**
 * Decrypt a value produced by `encrypt()`. Throws if tampered/invalid.
 *
 * @param payload - A base64 `iv:authTag:ciphertext` string from `encrypt`.
 * @returns The recovered UTF-8 plaintext.
 * @throws {Error} If the format is wrong or the GCM auth tag fails (tampering).
 * @example
 *   const original = decrypt(encrypt('hello')); // 'hello'
 */
export function decrypt(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('[crypto] Invalid encrypted payload format');
  }
  const [ivB64, tagB64, dataB64] = parts as [string, string, string];
  const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64')); // .final() throws if tag mismatches
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf-8');
}

/**
 * One-way SHA-256 hash (hex). For comparison/fingerprinting, not storage.
 *
 * @param input - String to hash.
 * @returns Lowercase hex SHA-256 digest.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Base64-encode a UTF-8 string (e.g. for Basic Auth headers).
 * @param input - UTF-8 string to encode.
 * @returns The base64 representation.
 */
export function toBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

/**
 * Decode a base64 string back to UTF-8.
 * @param input - Base64 string to decode.
 * @returns The decoded UTF-8 string.
 */
export function fromBase64(input: string): string {
  return Buffer.from(input, 'base64').toString('utf-8');
}

/**
 * Mask a secret for safe logging, e.g. `se****ce`.
 *
 * @param secret - The secret to mask.
 * @param visible - Characters to keep at each end (default 2).
 * @returns A masked string; fully masked if too short to show both ends.
 */
export function maskSecret(secret: string, visible = 2): string {
  if (secret.length <= visible * 2) return '*'.repeat(secret.length);
  const start = secret.slice(0, visible);
  const end = secret.slice(-visible);
  return `${start}${'*'.repeat(secret.length - visible * 2)}${end}`;
}
