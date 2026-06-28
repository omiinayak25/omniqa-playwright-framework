/**
 * --------------------------------------------------------
 * File: generate-catalog.cjs
 * Module: Test Catalog Generator
 * Project: OMNIQA Playwright Framework
 *
 * Purpose:
 *   Single source of truth → renders TEST_CATALOG.md and
 *   TEST_TRACEABILITY_MATRIX.md from ./catalog.data.cjs.
 *
 * Why data-driven:
 *   A 600+ row inventory hand-typed in markdown drifts the moment a test
 *   lands. Here every row is one compact record; the doc + all summary
 *   counts (smoke / regression / bdd / api / ui / db / a11y / perf / visual)
 *   are derived. Re-run after each module:  npm run catalog:gen
 *
 * Run: node scripts/catalog/generate-catalog.cjs
 * --------------------------------------------------------
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { MODULES, META } = require('./catalog.data.cjs');

const ROOT = path.resolve(__dirname, '..', '..');

// ---- ID assignment (deterministic, per-module prefix) ----
let GLOBAL = 0;
const rows = [];
for (const mod of MODULES) {
  mod.cases.forEach((c, i) => {
    GLOBAL += 1;
    const id = `${mod.prefix}-${String(i + 1).padStart(3, '0')}`;
    rows.push({ ...c, id, module: mod.name, app: mod.app, seq: GLOBAL });
  });
}

// ---- Tag derivation (Execution Tags column) ----
const CAT_TAG = {
  Positive: '@positive',
  Negative: '@negative',
  Boundary: '@boundary',
  Accessibility: '@a11y',
  Performance: '@perf',
  Visual: '@visual',
  Security: '@security',
  Smoke: '@smoke',
  Regression: '@regression',
};
function tagsFor(r) {
  const t = new Set();
  if (r.type === 'API') t.add('@api');
  else if (r.type === 'DB') t.add('@db');
  else if (r.type === 'E2E') t.add('@e2e');
  else t.add('@ui');
  if (CAT_TAG[r.category]) t.add(CAT_TAG[r.category]);
  // Suite membership: smoke for criticals, regression for everything.
  t.add('@regression');
  if (r.priority === 'Critical' || r.smoke) t.add('@smoke');
  if (r.bdd) t.add('@bdd');
  if (r.security) t.add('@security');
  if (r.tags) r.tags.forEach((x) => t.add(x));
  return [...t].join(' ');
}

// ---- Counters ----
const count = (pred) => rows.filter(pred).length;
const tagged = (tag) => rows.filter((r) => tagsFor(r).split(' ').includes(tag)).length;

const summary = {
  total: rows.length,
  implemented: count((r) => r.status === 'Implemented'),
  planned: count((r) => r.status === 'Planned'),
  partial: count((r) => r.status === 'Partial'),
  ui: count((r) => r.type === 'UI'),
  api: count((r) => r.type === 'API'),
  db: count((r) => r.type === 'DB'),
  e2e: count((r) => r.type === 'E2E'),
  smoke: tagged('@smoke'),
  regression: tagged('@regression'),
  bdd: count((r) => r.bdd),
  accessibility: count((r) => r.category === 'Accessibility'),
  performance: count((r) => r.category === 'Performance'),
  visual: count((r) => r.category === 'Visual'),
  security: count((r) => r.category === 'Security' || r.security),
  positive: count((r) => r.category === 'Positive'),
  negative: count((r) => r.category === 'Negative'),
  boundary: count((r) => r.category === 'Boundary'),
};

// ---- Markdown helpers ----
// Escape backslashes FIRST so the escape characters we add below aren't
// re-escaped, then escape table-breaking pipes and collapse newlines.
const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const yn = (b) => (b ? 'Y' : '—');

function moduleTable(mod) {
  const mrows = rows.filter((r) => r.module === mod.name);
  const head =
    '| ID | Feature | Type | Category | Pri | Sev | BDD | Status | Implemented File | Execution Tags | Expected Result |\n' +
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |';
  const body = mrows
    .map(
      (r) =>
        `| ${r.id} | ${esc(r.feature)} | ${r.type} | ${r.category} | ${r.priority} | ${r.severity} | ${yn(
          r.bdd,
        )} | ${r.status} | ${esc(r.file || '—')} | ${esc(tagsFor(r))} | ${esc(r.expected)} |`,
    )
    .join('\n');
  const impl = mrows.filter((r) => r.status === 'Implemented').length;
  return (
    `### ${mod.name} — ${mrows.length} cases (${impl} implemented, ${mrows.length - impl} planned)\n\n` +
    `_App under test: ${mod.app}._\n\n${head}\n${body}\n`
  );
}

// ---- Render TEST_CATALOG.md ----
let md = '';
md += `# OmniQA — TEST_CATALOG (Master Test Inventory)\n\n`;
md += `> Auto-generated from \`scripts/catalog/catalog.data.cjs\`. Do not hand-edit this file —\n`;
md += `> edit the data source and run \`npm run catalog:gen\`. Generated: ${META.generated}.\n\n`;
md += `## Totals\n\n`;
md += `| Metric | Count |\n| --- | --- |\n`;
md += `| **Total catalogued cases** | **${summary.total}** |\n`;
md += `| Implemented | ${summary.implemented} |\n`;
md += `| Planned | ${summary.planned} |\n`;
md += `| Partial | ${summary.partial} |\n`;
md += `| UI | ${summary.ui} |\n`;
md += `| API | ${summary.api} |\n`;
md += `| DB | ${summary.db} |\n`;
md += `| E2E | ${summary.e2e} |\n`;
md += `| Smoke | ${summary.smoke} |\n`;
md += `| Regression | ${summary.regression} |\n`;
md += `| BDD | ${summary.bdd} |\n`;
md += `| Accessibility | ${summary.accessibility} |\n`;
md += `| Performance | ${summary.performance} |\n`;
md += `| Visual | ${summary.visual} |\n`;
md += `| Security | ${summary.security} |\n`;
md += `| Positive | ${summary.positive} |\n`;
md += `| Negative | ${summary.negative} |\n`;
md += `| Boundary | ${summary.boundary} |\n\n`;

md += `## Per-Module Counts\n\n`;
md += `| # | Module | Target | Catalogued | Implemented | Planned |\n| --- | --- | --- | --- | --- | --- |\n`;
MODULES.forEach((mod, i) => {
  const mrows = rows.filter((r) => r.module === mod.name);
  const impl = mrows.filter((r) => r.status === 'Implemented').length;
  md += `| ${i + 1} | ${mod.name} | ${mod.target} | ${mrows.length} | ${impl} | ${
    mrows.length - impl
  } |\n`;
});
md += `\n## Schema\n\n`;
md += `Each row carries: **ID · Module · Feature · Type (UI/API/DB/E2E) · Category** (Positive / Negative / `;
md += `Boundary / Accessibility / Performance / Visual / Security — the test's primary intent) · **Priority** `;
md += `(Critical/High/Medium/Low) · **Severity** · **BDD** (Y/—) · **Automation Status** (Implemented/Partial/`;
md += `Planned) · **Implemented File** · **Execution Tags** (drive \`--grep\`) · **Expected Result**. `;
md += `Owner = QA Automation Guild unless noted in Remarks. Suite flags (Smoke/Regression) and the boolean `;
md += `category dimensions are encoded in Execution Tags so one row stays scannable.\n\n`;

md += `---\n\n## Catalog by Module\n\n`;
for (const mod of MODULES) md += moduleTable(mod) + '\n';

fs.writeFileSync(path.join(ROOT, 'TEST_CATALOG.md'), md);

// ---- Render TEST_TRACEABILITY_MATRIX.md (requirement → tests) ----
let tm = '';
tm += `# OmniQA — TEST_TRACEABILITY_MATRIX\n\n`;
tm += `> Auto-generated from \`scripts/catalog/catalog.data.cjs\` (\`npm run catalog:gen\`). `;
tm += `Maps each module/requirement area to its catalogued tests, status, and risk coverage. `;
tm += `Generated: ${META.generated}.\n\n`;
tm += `| Module (Requirement Area) | Target | Cases | Implemented | Coverage % | Smoke | BDD | Risk |\n`;
tm += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
for (const mod of MODULES) {
  const mrows = rows.filter((r) => r.module === mod.name);
  const impl = mrows.filter((r) => r.status === 'Implemented').length;
  const sm = mrows.filter((r) => tagsFor(r).split(' ').includes('@smoke')).length;
  const bd = mrows.filter((r) => r.bdd).length;
  const cov = mrows.length ? Math.round((impl / mrows.length) * 100) : 0;
  tm += `| ${mod.name} | ${mod.target} | ${mrows.length} | ${impl} | ${cov}% | ${sm} | ${bd} | ${
    mod.risk || '—'
  } |\n`;
}
tm += `\n**Totals:** ${summary.total} cases · ${summary.implemented} implemented · `;
tm += `${Math.round((summary.implemented / summary.total) * 100)}% implemented · `;
tm += `${summary.smoke} smoke · ${summary.bdd} BDD.\n`;
fs.writeFileSync(path.join(ROOT, 'TEST_TRACEABILITY_MATRIX.md'), tm);

// ---- Console summary ----
console.log('TEST_CATALOG.md + TEST_TRACEABILITY_MATRIX.md generated.');
console.log(JSON.stringify(summary, null, 2));
