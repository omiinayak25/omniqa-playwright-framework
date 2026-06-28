# Security Policy — OmniQA

> **OmniQA · Enterprise Playwright Automation Framework**
> How secrets, dependencies, and data are handled, and how to report a vulnerability.

---

## Secrets & Environment Variables

- **`.env` is git-ignored** and **excluded from the Docker image** (`.dockerignore`); it is injected at runtime via Compose `env_file`, never baked in.
- Only `.env.example` (placeholders, public demo values) is committed.
- `ENCRYPTION_SECRET` is a scrypt passphrase used to derive the AES-256-GCM key in `src/utils/crypto.util.ts`; it must come from CI secrets / the local environment.
- CI reads sensitive values from platform secret stores: GitHub Actions secrets, Jenkins Credentials (`credentials('...')`), Azure DevOps variable groups.

## Secret Vault

`src/secrets` provides a pluggable `SecretProvider`:

- `EnvSecretProvider` (default) — resolves from `process.env`.
- `VaultSecretProvider` — decrypts an **AES-256-GCM** encrypted JSON file (committable ciphertext) at `SECRETS_VAULT_FILE`.
- Swap in a real KMS (HashiCorp Vault, Azure Key Vault, AWS Secrets Manager) by implementing the same interface — call sites do not change (Dependency Inversion).

## Safe Logging

- Use `maskSecret()` (`src/utils/crypto.util.ts`) before logging any sensitive value (e.g. `se****ce`).
- Winston output is structured with correlation IDs; do not log raw credentials, tokens, or full auth headers.

## SQL Injection Protection

- All database access goes through `QueryRunner` over a parameterised `pg` pool.
- **Never** interpolate user/test input into SQL strings; use parameter placeholders (`$1, $2, …`).
- DB tests include explicit injection-safety assertions.

## XSS / Output Handling

- Generated HTML reports (a11y/perf dashboards, report attachments) **escape** all dynamic content via `escapeHtml()` before interpolation.

## Authentication & Authorization

- UI auth is performed once by the `setup` project and persisted as Playwright **storage state** under `.auth/` (git-ignored), then reused — credentials are not re-entered per test.
- API auth uses tokens obtained through the auth service; tokens are not committed or logged in clear text.

## Dependency Management

- **Pinned** via `package-lock.json`; CI installs with `npm ci`.
- **`npm run audit:security`** (`npm audit --audit-level=high`) — no high/critical advisories at last audit.
- **OWASP Dependency-Check** (`.github/workflows/security.yml`) scans against the NVD (fails on CVSS ≥ 8).
- **CodeQL** (`.github/workflows/codeql.yml`) — SAST with `security-and-quality` queries.
- **SonarCloud** quality gate ingests `coverage/lcov.info`.
- **depcheck** keeps the dependency surface minimal (no unused packages).

## Reporting a Vulnerability

Please **do not** open a public issue for security problems. Instead:

1. Open a private security advisory on the repository (GitHub → Security → Advisories), **or**
2. Contact the maintainer directly via the repository owner profile.

Include a description, reproduction steps, affected files/versions, and impact. We aim to acknowledge
within a few business days and to coordinate a fix and disclosure timeline.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |
