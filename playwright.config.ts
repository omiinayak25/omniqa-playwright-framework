/**
 * Playwright Test — root configuration.
 *
 * Design goals:
 *  - One config, many "projects" (UI browsers, API, DB, E2E, a11y, visual, perf).
 *  - Zero hardcoded values — everything flows from `.env` via the env accessor.
 *  - Rich reporting (list + HTML + JUnit + Allure) and full failure diagnostics
 *    (trace, screenshot, video) so CI failures are debuggable without re-running.
 */
import { defineConfig, devices } from '@playwright/test';
import { getEnvBoolean, getEnvNumber, getEnvOptional } from '@config/env';

const HEADLESS = getEnvBoolean('HEADLESS', true);
const DEFAULT_TIMEOUT = getEnvNumber('DEFAULT_TIMEOUT_MS', 30_000);
const EXPECT_TIMEOUT = getEnvNumber('EXPECT_TIMEOUT_MS', 10_000);
const RETRIES = getEnvNumber('RETRIES', 1);
const WORKERS = getEnvNumber('WORKERS', 4);
const IS_CI = getEnvBoolean('CI', false);

// Visual-regression defaults (also exposed via @config/config for the helper).
const VISUAL_MAX_DIFF_RATIO = getEnvNumber('VISUAL_MAX_DIFF_PIXEL_RATIO', 0.02);
const VISUAL_THRESHOLD = getEnvNumber('VISUAL_THRESHOLD', 0.2);

export default defineConfig({
  // ---- Where specs live ----
  testDir: './tests',

  // ---- Run-wide lifecycle hooks ----
  globalSetup: require.resolve('./src/hooks/global-setup.ts'),
  globalTeardown: require.resolve('./src/hooks/global-teardown.ts'),

  // ---- Global execution policy ----
  timeout: DEFAULT_TIMEOUT,
  expect: {
    timeout: EXPECT_TIMEOUT,
    // Default tolerance for visual-regression snapshots. Per-test overrides
    // flow through the VisualComparator helper (@visual/visual-comparator).
    toHaveScreenshot: {
      maxDiffPixelRatio: VISUAL_MAX_DIFF_RATIO,
      threshold: VISUAL_THRESHOLD,
      animations: 'disabled',
      // Render at CSS pixel scale so snapshots are stable across DPRs.
      scale: 'css',
    },
  },
  fullyParallel: true,
  forbidOnly: IS_CI, // fail CI if someone left a `test.only`
  retries: IS_CI ? RETRIES : 0,
  workers: IS_CI ? WORKERS : undefined,

  // ---- Artifacts & output ----
  outputDir: './test-results',

  // ---- Reporters: machine-readable (CI) + human-readable (local) ----
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
    ['./src/custom-reporters/summary-reporter.ts'], // custom summary + summary.json
    ['./src/custom-reporters/flaky-reporter.ts'], // flaky detection + flaky.json
  ],

  // ---- Shared defaults for every project ----
  use: {
    headless: HEADLESS,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry', // capture a trace only when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },

  // ---- Projects: each maps a test type to a runtime ----
  projects: [
    // ----- Auth setup: logs in once, saves storage state for reuse -----
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // ----- UI: cross-browser -----
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['setup'], // run auth setup before chromium UI tests
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'] },
    },
    // ----- Mobile responsive -----
    {
      name: 'ui-mobile',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'] },
    },
    // ----- API: no browser needed -----
    {
      name: 'api',
      testDir: './tests/api',
    },
    // ----- Database -----
    {
      name: 'db',
      testDir: './tests/db',
    },
    // ----- End-to-end (UI + API + DB) -----
    {
      name: 'e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'], // SauceDemo auth reuse for UI journeys
      use: { ...devices['Desktop Chrome'] },
    },
    // ----- Accessibility -----
    {
      name: 'accessibility',
      testDir: './tests/accessibility',
      use: { ...devices['Desktop Chrome'] },
    },
    // ----- Visual regression -----
    {
      name: 'visual',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'] },
    },
    // ----- Performance smoke -----
    {
      name: 'performance',
      testDir: './tests/performance',
      use: { ...devices['Desktop Chrome'] },
    },
    // ----- Network (route mocking / interception / HAR) -----
    {
      name: 'network',
      testDir: './tests/network',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

// Keep referenced so unused-import lint stays quiet until projects expand.
export const ACTIVE_ENVIRONMENT = getEnvOptional('TEST_ENV', 'qa');
