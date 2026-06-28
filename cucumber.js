/**
 * Cucumber.js configuration.
 *
 * Runtime TypeScript + path aliases:
 *  - `ts-node/register` transpiles step defs/world/hooks on the fly.
 *  - `tsconfig.json`'s `ts-node.require` loads `tsconfig-paths/register`, so
 *    `@pages`, `@services`, `@bdd` … resolve at RUNTIME (TS aliases alone are
 *    compile-time only — Cucumber needs this to import our framework code).
 */
module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/cucumber/**/*.ts', 'step-definitions/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'summary',
      'html:reports/cucumber/report.html',
      'json:reports/cucumber/report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
