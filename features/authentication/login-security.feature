# =====================================================================
#  Feature: SauceDemo Login Security
#  Module: Authentication
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify the sign-in form protects credentials and treats
#                       injection payloads as inert data (no auth bypass).
#  Business Value ..... A login form is the prime target for XSS/SQLi; failing
#                       here risks account takeover and data exposure.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... High
#  Tags ............... @ui @saucedemo @authentication @security
#  Related Page Objects SauceLoginPage, SauceInventoryPage
# =====================================================================
@ui @saucedemo @authentication @security
Feature: SauceDemo Login Security
  As the platform owner
  I want the sign-in form to resist injection and protect credentials
  So that customer accounts stay secure

  Background:
    Given I am on the SauceDemo login page

  @regression @security
  Scenario: The password field masks the entered value
    Then the password field should mask the entered value

  @regression @security @negative
  Scenario Outline: Injection payloads in the username do not grant access
    When I attempt to sign in with username "<payload>" and password "secret_sauce"
    Then I should be denied access with the message "Username and password do not match"
    And I should remain on the SauceDemo login page

    Examples: Adversarial usernames
      | payload                   |
      | <script>alert(1)</script> |
      | ' OR '1'='1' --           |
      | admin'--                  |
      | <img src=x onerror=alert(1)> |
