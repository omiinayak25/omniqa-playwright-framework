# OmniQA — Test Coverage Report & Expansion Plan

> Step 1 deliverable — repository audit, current coverage, gap analysis, and a module-by-module
> expansion roadmap to reach **500+ meaningful test cases**. No tests are generated in this step.
> Generated: 2026-06-28 · Baseline commit: `bda04ed`

---

## 1. Executive Summary

> **Update (post-expansion + gap-closure, target met):** unique runtime cases **501** (400 Playwright + 101 BDD);
> ~**940 executable** across the 4-browser matrix. Catalogued **298/632** implemented. **500+ unique target cleared.**
> See [TEST_CATALOG.md](../TEST_CATALOG.md) / [TEST_TRACEABILITY_MATRIX.md](../TEST_TRACEABILITY_MATRIX.md). Baseline figures below are the pre-expansion starting point.

| Metric                                                                              | Value    |
| ----------------------------------------------------------------------------------- | -------- |
| Playwright `test()` blocks                                                          | **143**  |
| BDD scenarios (Gherkin)                                                             | **80**   |
| **Total authored test cases**                                                       | **~223** |
| Spec files                                                                          | 38       |
| Feature files                                                                       | 19       |
| Step-definition files                                                               | 17       |
| Reusable layers (pages/components/flows/services/repos/builders/factories/fixtures) | Mature   |
| **Net new meaningful cases required to reach 500+**                                 | **~280** |

The framework is architecturally mature (8-layer DI fixture chain, POM + Component + Flow, Repository,
Builder/Factory, custom reporters, multi-CI). **The gap is coverage breadth, not framework capability.**
Expansion will reuse existing page objects, services, repositories, builders, factories, and fixtures —
no new architecture, no new patterns.

---

## 2. Applications & Systems Under Test

| System               | Type                | Surface exercised today           | Reusable assets                                                                                                       |
| -------------------- | ------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **SauceDemo**        | E-commerce UI       | login, inventory, cart, checkout  | `sauceLoginPage`, `sauceInventoryPage`, `sauceCartPage`, `sauceCheckout*Page`, `checkoutFlow`, `SauceHeaderComponent` |
| **OrangeHRM**        | HR admin UI         | login, PIM list/search            | `orangeLoginPage`, `orangeDashboardPage`, `orangePimPage`, `DataTableComponent`, `PaginationComponent`                |
| **ReqRes**           | REST API (users)    | list/CRUD/pagination              | `userApi`, `ResponseValidator`                                                                                        |
| **DummyJSON**        | REST API (products) | list/search/CRUD                  | `productApi`                                                                                                          |
| **JSONPlaceholder**  | REST API (posts)    | CRUD                              | `postApi`                                                                                                             |
| **Swagger PetStore** | REST API (pets)     | create/find                       | `petApi`                                                                                                              |
| **Restful-Booking**  | REST API (booking)  | auth + CRUD lifecycle             | `bookingApi`, `authApi`                                                                                               |
| **PostgreSQL**       | Database            | employee/department/product repos | `employeeRepo`, `departmentRepo`, `productRecordRepo`, `dbAssert`                                                     |

---

## 3. Current Coverage By Project

| Project / Area        | PW tests | BDD scen. | Notes                                                                             |
| --------------------- | -------- | --------- | --------------------------------------------------------------------------------- |
| `tests/api`           | 57       | 24        | Strongest area — CRUD, contract, negative/boundary, SLA, logging, fixtures, utils |
| `tests/db`            | 20       | 11        | Repository CRUD + advanced (transactions/rollback)                                |
| `tests/accessibility` | 18       | 8         | axe scans on SauceDemo login/inventory + OrangeHRM login                          |
| `tests/e2e`           | 15       | 3         | API→DB sync, booking lifecycle, employee lifecycle, purchase                      |
| `tests/ui/saucedemo`  | 11       | 25        | login, inventory, checkout, data-driven login                                     |
| `tests/performance`   | 7        | 4         | login/inventory timings + Lighthouse                                              |
| `tests/visual`        | 6        | 3         | login + inventory snapshots                                                       |
| `tests/network`       | 5        | —         | route mocking / interception                                                      |
| `tests/ui/orangehrm`  | 4        | —         | login + PIM                                                                       |
| `tests/setup`         | —        | —         | auth storage-state generation                                                     |

---

## 4. Gap Analysis — Module by Module

Target = the prompt's per-module goal. Current = test cases mapped to that capability today
(UI + BDD + API where applicable). Gap = net new meaningful cases needed.

| #   | Module                | Target   | Current (~) | Gap (~)     | Risk | Primary reuse                                            |
| --- | --------------------- | -------- | ----------- | ----------- | ---- | -------------------------------------------------------- |
| 1   | Authentication        | 50+      | 17          | **33**      | High | login pages, BDD auth steps, `authApi`                   |
| 2   | Authorization         | 40+      | 0           | **40**      | High | OrangeHRM roles, storage-state, `authApi`                |
| 3   | Dashboard             | 25+      | 2           | **23**      | Med  | `orangeDashboardPage` (needs widget methods)             |
| 4   | Inventory             | 70+      | 11          | **59**      | High | `sauceInventoryPage`, `productApi`                       |
| 5   | Shopping Cart         | 50+      | 9           | **41**      | High | `sauceCartPage`, `SauceHeaderComponent`                  |
| 6   | Checkout              | 70+      | 9           | **61**      | High | `sauceCheckout*Page`, `checkoutFlow`, `checkout.builder` |
| 7   | Forms                 | 40+      | 2           | **38**      | High | `orangePimPage` (add-employee form)                      |
| 8   | Search                | 30+      | 2           | **28**      | Med  | PIM `searchByName`, inventory, `productApi` search       |
| 9   | Tables                | 30+      | 2           | **28**      | Med  | `DataTableComponent`, `PaginationComponent`              |
| 10  | File Upload           | 20+      | 0           | **20**      | Med  | OrangeHRM PIM photo upload + `downloads/`                |
| 11  | Browser Compatibility | 20+      | ~           | **15**      | Low  | existing ui-firefox/webkit/mobile projects               |
| 12  | Accessibility         | 25+      | 18          | **7**       | Low  | `a11yScanner`, `keyboard`                                |
| 13  | Visual                | 20+      | 6           | **14**      | Low  | `VisualComparator`, `dynamic-elements`                   |
| 14  | Performance           | 15+      | 7           | **8**       | Low  | `perf`, `lighthouse`, budgets                            |
| 15  | API Validation        | 50+      | 57          | **0 (met)** | Low  | already met; add chaining/schema depth                   |
| 16  | Database              | 30+      | 20          | **10**      | Med  | repositories, `dbAssert`                                 |
| 17  | End-to-End            | 30+      | 15          | **15**      | Med  | flows + API + repos                                      |
| 18  | Error Handling        | 20+      | 5           | **15**      | Med  | `network` route abort/status                             |
| 19  | Network               | 15+      | 5           | **10**      | Med  | `NetworkManager`, HAR                                    |
| 20  | Security              | 15+      | 3           | **12**      | High | payload builders, `negative-boundary`                    |
|     | **TOTAL**             | **735+** | **~223**    | **~280**    |      |                                                          |

> Reaching ~60% of targets clears 500+. Priority is the **High-risk / large-gap** modules first
> (Checkout, Inventory, Cart, Authentication, Authorization, Forms).

---

## 5. Missing Scenarios (Highlights)

**Authentication** — empty username/password, whitespace/unicode/trim, problem_user & performance_glitch_user
behavior, session expiry/refresh/persistence, multi-tab, browser back/forward after logout, keyboard-only login,
error-message exactness, password-field masking, login API status/schema, rate-limit/lockout.

**Authorization** — OrangeHRM Admin vs ESS role menus, direct-URL access to restricted pages, deep-link without
session → redirect to login, privilege escalation attempts, role switch, expired/forged storage state.

**Inventory** — all 3 sort orders (name A–Z/Z–A, price hi/lo) verified, product detail page (PDP) open/back,
add/remove from PDP, image src/alt per product, price format, description integrity, reset app state, sort
persistence, responsive grid, a11y of cards, `productApi` count parity.

**Shopping Cart** — add N then remove subset, quantity display, badge math, persistence across navigation/refresh/
re-login, continue-shopping returns to inventory preserving cart, remove-all → empty state, checkout from empty
cart blocked, cart item links to PDP.

**Checkout** — first/last/zip each empty (3 distinct error messages), valid info → overview, item/price/qty parity,
subtotal = Σ items, tax computation, total = subtotal + tax, cancel from info & overview, finish → confirmation,
"Back Home", boundary/unicode names, long-string zip, `checkout.builder` invalid/boundary datasets, E2E with DB.

**Forms (OrangeHRM PIM Add Employee)** — required fields, name length boundaries, employee-id format, optional
login-details toggle, password policy/confirm-mismatch, dropdowns, date-of-birth picker, save & verify in list,
cancel discards, duplicate handling.

**Search/Tables** — exact/partial/case/whitespace/special/unicode/empty/no-result, pagination next/prev/last,
records-found count, per-page size, sortable columns, row selection/delete, large-input performance.

**Security** — XSS payloads in login & search & checkout fields, SQLi payloads against API + DB repos, sensitive
data not in DOM/logs/storage, auth headers, cookie flags, session fixation, error messages don't leak internals.

**Error Handling / Network** — mock 404/500/timeout/empty-body/malformed-JSON, offline mode, slow-3G throttling,
request abort, retry behavior, fallback UI, HAR replay determinism.

---

## 6. Weak Modules & Risk Areas

| Area               | Why it's weak / risky                                      | Action                                                          |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------- |
| **Authorization**  | Zero coverage — highest business risk (access control)     | Build role-based suite using OrangeHRM + storage-state strategy |
| **Checkout**       | Thin coverage on a money path (tax/total math, validation) | Largest expansion; decision-table + boundary + E2E+DB           |
| **Forms**          | Only happy-path PIM add; no validation matrix              | Equivalence partitioning + BVA on add-employee                  |
| **Security**       | Payloads only in 2–3 API negatives; no UI injection tests  | Reuse builders for XSS/SQLi datasets across UI+API+DB           |
| **Dashboard**      | No widget/card/count assertions                            | Add `orangeDashboardPage` widget methods, then tests            |
| **File Upload**    | Capability unbuilt (no upload/download tests)              | Add OrangeHRM photo upload + download validation                |
| **Error Handling** | Limited to 5 route-mock cases                              | Expand status/timeout/offline matrix via `NetworkManager`       |

---

## 7. Test-Design Techniques To Apply (per module)

- **BVA / Equivalence Partitioning** — form fields, zip, quantities, pagination sizes, API page params.
- **Decision Tables** — checkout validation (first/last/zip presence combinations), authorization (role × page).
- **State Transition** — session lifecycle (logged-out → in → expired), cart (empty → filled → cleared).
- **Pairwise** — browser × viewport × user-type combinations.
- **Error Guessing / Exploratory** — whitespace, unicode, copy-paste, double-submit, back-button.
- **Risk-Based** — front-load Checkout/Auth/Authorization/Security.
- **Data-Driven** — JSON/CSV + Faker via existing builders/factories; Scenario Outlines for BDD.

---

## 8. Proposed Expansion Sequence (by risk × gap)

1. **Authentication** (50+) — anchors session/security primitives reused everywhere
2. **Authorization** (40+) — zero today, high risk
3. **Inventory** (70+) — large gap, core shopper path
4. **Shopping Cart** (50+)
5. **Checkout** (70+) — money path, E2E+DB
6. **Forms** (40+) — OrangeHRM validation matrix
7. **Search** (30+) → **Tables** (30+)
8. **Database** (30+) → **End-to-End** (30+)
9. **Security** (15+) → **Error Handling** (20+) → **Network** (15+)
10. **Accessibility** (+7) → **Visual** (+14) → **Performance** (+8) → **Browser Compat** (+15) → **File Upload** (20+)

Per the implementation strategy, each module ships as: Coverage Analysis → Missing Scenarios →
Test Case Matrix → Playwright Implementation → BDD (where appropriate) → Best Practices →
Interview Questions → Validation Results (`typecheck` + `lint` + targeted run), then **pause for approval**.

---

## 9. Anti-Duplication & Reuse Rules (enforced during expansion)

- Never `new` a page object/service/repo in a spec — inject via fixtures.
- Assertions live in specs, never in `src/`.
- New data comes from builders/factories (valid/invalid/boundary), never inline literals.
- Before adding a test, grep existing specs/features for the scenario; extend, don't copy.
- Shared payload datasets (XSS/SQLi/unicode/whitespace) centralized in factories for reuse across UI+API+DB.
- New page/component **methods** may be added where a capability is missing (e.g. PDP, dashboard widgets,
upload) — this extends the POM, it does not change the architecture.
</content>
