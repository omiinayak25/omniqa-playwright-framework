# =====================================================================
#  Feature: SauceDemo Session Persistence & Protection
#  Module: Authentication
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify an authenticated session is remembered when a
#                       shopper navigates directly to a protected page, and that
#                       the catalog is protected from unauthenticated access.
#  Business Value ..... Remembered sessions reduce friction for returning
#                       customers; protected routes keep accounts and orders safe.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... Medium / High
#  Tags ............... @ui @saucedemo @authentication
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceLoginPage, SauceInventoryPage
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @authentication
Feature: SauceDemo Session Persistence & Protection
  As a SauceDemo shopper
  I want my authenticated session to be remembered
  So that I can resume shopping without signing in again, while my account stays protected

  # "Remember Authentication": once signed in, opening a protected page directly
  # must NOT ask the shopper to authenticate again.
  @regression @positive
  Scenario: A signed-in session is remembered across direct navigation
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    When I open the product catalog directly
    Then I should see the product catalog
    And I should see 6 products available

  # "Session Validation": without a valid session the catalog must not be served.
  @regression @negative @high
  Scenario: The catalog is protected from unauthenticated access
    Given I am on the SauceDemo login page
    When I try to open the product catalog directly
    Then access should require signing in again
