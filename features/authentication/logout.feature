# =====================================================================
#  Feature: SauceDemo Logout
#  Module: Authentication
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify a signed-in shopper can end their session and
#                       that the catalog is no longer reachable afterwards.
#  Business Value ..... Reliable sign-out protects customer accounts on shared
#                       devices and prevents unauthorised access after leaving.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... High
#  Tags ............... @ui @saucedemo @authentication
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceLoginPage, SauceInventoryPage
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @authentication
Feature: SauceDemo Logout
  As a signed-in SauceDemo shopper
  I want to sign out of my account
  So that my session ends and my account stays secure

  @smoke @positive
  Scenario: A signed-in user can sign out
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I should see the product catalog
    When I sign out
    Then I should be returned to the SauceDemo login page

  @regression @negative @high
  Scenario: The catalog cannot be reached after signing out
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I sign out
    When I try to open the product catalog directly
    Then access should require signing in again
