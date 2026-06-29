# =====================================================================
#  Feature: SauceDemo Login
#  Module: Authentication
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify shoppers can sign in, and that invalid or
#                       restricted attempts are correctly rejected.
#  Business Value ..... Authentication is the gate to the whole store; a broken
#                       or insecure sign-in blocks every customer and every sale.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... Critical
#  Tags ............... @ui @saucedemo @authentication
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceLoginPage, SauceInventoryPage
#  Related APIs ....... none (pure UI authentication)
# =====================================================================
@ui @saucedemo @authentication
Feature: SauceDemo Login
  As a SauceDemo shopper
  I want to sign in to my account
  So that I can browse and purchase products

  # Every scenario starts from a clean, logged-out login screen.
  Background:
    Given I am on the SauceDemo login page

  Rule: Recognised users are granted access to the product catalog

    @smoke @positive @critical
    Scenario: A standard user signs in successfully
      When I sign in with valid credentials
      Then I should see the product catalog
      And I should see 6 products available

    # Some demo accounts behave oddly (broken images, slowness) but are still
    # valid customers and must be allowed in.
    @regression @positive
    Scenario Outline: Valid accounts are granted access despite account quirks
      When I sign in as "<user>"
      Then access should be "granted"

      Examples: Functional user variations
        | user                    |
        | standard_user           |
        | problem_user            |
        | performance_glitch_user |
        | error_user              |
        | visual_user             |

  Rule: Invalid or restricted sign-in attempts are rejected

    @regression @negative @high
    Scenario: A locked-out user is denied access
      When I sign in as "locked_out_user"
      Then I should be denied access with the message "locked out"
      And I should remain on the SauceDemo login page

    @regression @negative
    Scenario: Sign-in fails with an incorrect password
      When I sign in as "standard_user" with password "wrong_password"
      Then I should be denied access with the message "Username and password do not match"

    @regression @negative
    Scenario Outline: Sign-in requires both a username and a password
      When I attempt to sign in with username "<user>" and password "<pass>"
      Then I should be denied access with the message "<message>"

      Examples: Missing required fields
        | user          | pass         | message              |
        |               | secret_sauce | Username is required |
        | standard_user |              | Password is required |
