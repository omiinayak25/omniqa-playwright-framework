/**
 * --------------------------------------------------------
 * Commitlint configuration — OMNIQA Playwright Framework
 *
 * Enforces Conventional Commits (feat:, fix:, docs:, test:, ci:, chore:, …)
 * via the commit-msg Git hook (.husky/commit-msg). Conventional Commits give
 * a machine-readable history → automated changelogs + semantic versioning.
 * --------------------------------------------------------
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow a slightly longer subject than the 72-char default.
    'header-max-length': [2, 'always', 100],
    // Curated type list (superset of the default) for this QA framework.
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
  },
};
