/**
 * --------------------------------------------------------
 * ESLint configuration — OMNIQA Playwright Framework
 *
 * Legacy (.eslintrc) config so `eslint . --ext .ts` keeps working on
 * ESLint 8. TypeScript-aware (non-type-checked ruleset — fast, no project
 * service needed), Prettier-compatible (eslint-config-prettier turns OFF
 * all formatting rules so Prettier owns formatting), and Playwright-aware
 * for the test layers only.
 * --------------------------------------------------------
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // MUST be last — disables rules that conflict with Prettier
  ],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'reports/',
    'test-results/',
    'playwright-report/',
    'coverage/',
    '*-snapshots/',
    '*.js',
    '*.cjs',
  ],
  rules: {
    // ---- Strictness the framework promises ----
    '@typescript-eslint/no-explicit-any': 'error', // the "no any" rule, enforced
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    'no-console': 'warn', // prefer the winston logger (scripts are exempt below)
    eqeqeq: ['error', 'smart'],
    'prefer-const': 'error',
    'no-var': 'error',
    // Playwright fixtures legitimately destructure `{}` as the first arg.
    'no-empty-pattern': 'off',

    // ---- Path-alias hygiene: forbid deep relative imports; use @aliases ----
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../*', '../../../*'],
            message: 'Use a path alias (e.g. @utils/...) instead of a deep relative import.',
          },
        ],
      },
    ],
  },
  overrides: [
    // ---- Playwright Test specs only (NOT Cucumber step-defs) ----
    {
      files: ['tests/**/*.ts'],
      extends: ['plugin:playwright/recommended'],
      rules: {
        // Assertions live in reusable helper classes (a11y/perf/visual), so a
        // test body may legitimately contain no literal `expect(`.
        'playwright/expect-expect': 'off',
        'playwright/no-skipped-test': 'off', // we skip the opt-in Lighthouse test by design
      },
    },
    // ---- Standalone scripts: console output is the intended UX ----
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
