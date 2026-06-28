# syntax=docker/dockerfile:1
# =====================================================================
#  OMNIQA Playwright Framework — test-runner image
#  Explained line-by-line (Phase 19). Built FROM the official Playwright
#  image so browsers + all OS libraries are already present and version-
#  matched to @playwright/test (^1.49.1).
# =====================================================================

# ---- Base image -----------------------------------------------------
# The Microsoft Playwright image bundles Node.js 20 (LTS), the three
# browser engines (Chromium/Firefox/WebKit) AND every system dependency
# they need. The tag MUST match the Playwright version in package.json,
# otherwise the preinstalled browser builds won't match the test runner.
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# ---- Metadata (OCI labels) -----------------------------------------
LABEL org.opencontainers.image.title="omniqa-playwright-framework" \
      org.opencontainers.image.description="Enterprise Playwright + TypeScript test runner" \
      org.opencontainers.image.licenses="MIT"

# ---- Runtime environment -------------------------------------------
# CI=true     → playwright.config enables retries, fixed workers, forbidOnly.
# HEADLESS=true→ browsers run without a display (no X server in a container).
# CI mode also silences interactive prompts from npm/playwright.
ENV CI=true \
    HEADLESS=true \
    NODE_ENV=test
# PLAYWRIGHT_BROWSERS_PATH is already set by the base image (browsers live
# at /ms-playwright) — we deliberately DO NOT override it.

# ---- Working directory ---------------------------------------------
# All subsequent commands run relative to /app; created if absent.
WORKDIR /app

# ---- Dependency layer (cache-friendly) -----------------------------
# Copy ONLY the manifest + lockfile first. Docker caches this layer and
# the `npm ci` below, so application code changes don't reinstall deps.
COPY package.json package-lock.json ./

# `npm ci` installs EXACTLY the locked versions (reproducible, faster than
# `npm install`). We skip Playwright's browser download because the base
# image already ships them.
RUN npm ci --no-audit --no-fund

# ---- Application source --------------------------------------------
# Now copy the rest of the project. Anything matched by .dockerignore
# (node_modules, reports, .env, …) is excluded from this layer.
COPY . .

# ---- Default command ------------------------------------------------
# The image's natural job is to run the whole Playwright suite. Compose
# (docker-compose.yml) overrides this with a DB-focused subset; CI can
# pass any `playwright test ...` arguments to target specific projects.
CMD ["npx", "playwright", "test"]
