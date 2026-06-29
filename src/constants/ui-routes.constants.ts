/**
 * --------------------------------------------------------
 * File: ui-routes.constants.ts
 * Module: Constants
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * UI route paths (relative to each app's base URL) for the apps under test.
 *
 * Responsibilities:
 * - Provide the single source of truth for navigation targets.
 *
 * Used By:
 * Page objects and UI tests when navigating.
 *
 * Dependencies:
 * None.
 *
 * Last Updated: 2026-06-27
 * Notes:
 * Centralized to keep hardcoded navigation paths out of page objects/tests,
 * so a route change is a one-line edit.
 * --------------------------------------------------------
 */

/** SauceDemo route paths (login, inventory, cart, checkout steps). */
export const SAUCEDEMO_ROUTES = {
  LOGIN: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;

/** OrangeHRM route paths (auth, dashboard, PIM, add-employee, admin users). */
export const ORANGEHRM_ROUTES = {
  LOGIN: '/web/index.php/auth/login',
  DASHBOARD: '/web/index.php/dashboard/index',
  PIM: '/web/index.php/pim/viewEmployeeList',
  ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',
  ADMIN_USERS: '/web/index.php/admin/viewSystemUsers',
} as const;
