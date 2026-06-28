# --------------------------------------------------------
# Feature File: saucedemo-login.feature
# Project: OMNIQA Playwright Framework
# Purpose: BDD coverage of SauceDemo login outcomes across user types.
# Strategy: Background + Scenario + Scenario Outline (Examples)
# Tags: @ui @saucedemo @smoke @regression
# Last Updated: 2026-06-27
# --------------------------------------------------------
@ui @saucedemo
Feature: SauceDemo login
  As a SauceDemo user
  I want to authenticate
  So that I can access the product inventory

  Background:
    Given I am on the SauceDemo login page

  @smoke
  Scenario: Standard user logs in successfully
    When I log in as "standard_user" with password "secret_sauce"
    Then I should land on the inventory page
    And I should see 6 products

  @regression
  Scenario Outline: Login outcomes for different users
    When I log in as "<username>" with password "secret_sauce"
    Then the result should be "<outcome>"

    Examples:
      | username                | outcome   |
      | standard_user           | success   |
      | problem_user            | success   |
      | locked_out_user         | error     |

  @regression
  Scenario: Locked out user sees a descriptive error
    When I log in as "locked_out_user" with password "secret_sauce"
    Then I should see an error containing "locked out"
