# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui/saucedemo/authorization.spec.ts >> SauceDemo · Authorization — protected routes @ui @regression @authorization @negative >> checkout (overview) deep-link without a session is not served
- Location: tests/ui/saucedemo/authorization.spec.ts:41:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Swag Labs
  - generic [ref=e5]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - textbox "Username" [ref=e11]
        - img [ref=e12]
      - generic [ref=e14]:
        - textbox "Password" [ref=e15]
        - img [ref=e16]
      - 'heading "Epic sadface: You can only access ''/checkout-step-two.html'' when you are logged in." [level=3] [ref=e19]':
        - button [ref=e20] [cursor=pointer]:
          - img [ref=e21]
        - text: "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."
      - button "Login" [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "Accepted usernames are:" [level=4] [ref=e27]
        - text: standard_user
        - text: locked_out_user
        - text: problem_user
        - text: performance_glitch_user
        - text: error_user
        - text: visual_user
      - generic [ref=e28]:
        - heading "Password for all users:" [level=4] [ref=e29]
        - text: secret_sauce
```

# Test source

```ts
  1  | /**
  2  |  * --------------------------------------------------------
  3  |  * File: authorization.spec.ts
  4  |  * Module: UI Tests · Authorization
  5  |  * Project: OMNIQA Playwright Framework
  6  |  *
  7  |  * Feature Under Test: SauceDemo protected-route access control.
  8  |  * Business Scenario: Cart and checkout pages must never be served to an
  9  |  *                    unauthenticated visitor who navigates to them directly.
  10 |  * Preconditions: Clean (logged-out) session; network access to SauceDemo.
  11 |  * Test Strategy: Negative route-protection (deep-link without a session).
  12 |  * Expected Outcome: Each protected deep-link bounces back to the login screen.
  13 |  * Priority: High
  14 |  * Tags: @ui @regression @authorization @negative
  15 |  *
  16 |  * Last Updated: 2026-06-28
  17 |  * --------------------------------------------------------
  18 |  */
  19 | import { test, expect } from '@fixtures/index';
  20 | 
  21 | test.use({ storageState: { cookies: [], origins: [] } });
  22 | 
  23 | test.describe('SauceDemo · Authorization — protected routes @ui @regression @authorization @negative', () => {
  24 |   test('cart deep-link without a session is not served', async ({
  25 |     sauceCartPage,
  26 |     sauceLoginPage,
  27 |   }) => {
  28 |     await sauceCartPage.open();
  29 |     // SauceDemo bounces protected pages back to the login screen.
  30 |     expect(await sauceLoginPage.isLoaded()).toBe(true);
  31 |   });
  32 | 
  33 |   test('checkout (step one) deep-link without a session is not served', async ({
  34 |     sauceCheckoutInfoPage,
  35 |     sauceLoginPage,
  36 |   }) => {
  37 |     await sauceCheckoutInfoPage.open();
  38 |     expect(await sauceLoginPage.isLoaded()).toBe(true);
  39 |   });
  40 | 
  41 |   test('checkout (overview) deep-link without a session is not served', async ({
  42 |     sauceCheckoutOverviewPage,
  43 |     sauceLoginPage,
  44 |   }) => {
  45 |     await sauceCheckoutOverviewPage.open();
> 46 |     expect(await sauceLoginPage.isLoaded()).toBe(true);
     |                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  47 |   });
  48 | });
  49 | 
```