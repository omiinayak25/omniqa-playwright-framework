# =====================================================================
#  Feature: SauceDemo Login Accessibility
#  Module: Accessibility
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify the login screen is operable by assistive tech
#                       and keyboard users (WCAG 2.1 A/AA): scan, ARIA, contrast,
#                       labels, alt-text, keyboard reachability and focus order.
#  Business Value ..... Accessibility is a legal/ethical requirement; the first
#                       screen everyone sees must work for everyone.
#  Automation Layer ... Accessibility (Cucumber-JS → axe-core scanner + keyboard)
#  Priority ........... High
#  Tags ............... @accessibility @a11y @ui
#  Related Page Objects SauceLoginPage
#  Related APIs ....... none
# =====================================================================
@accessibility @a11y @ui
Feature: SauceDemo Login Accessibility
  As a user relying on assistive technology
  I want the login screen to meet accessibility standards
  So that I can sign in regardless of ability

  Background:
    Given I am on the SauceDemo login page

  @smoke @positive @critical
  Scenario: The login screen passes a WCAG 2.1 A/AA scan
    Then the page should have no accessibility violations

  @regression @positive
  Scenario: ARIA roles, states and properties are valid
    Then the page should have no ARIA accessibility violations

  @regression @positive
  Scenario: Text meets the WCAG AA colour-contrast ratio
    Then the page text should meet colour-contrast requirements

  @regression @positive
  Scenario: Every form field is programmatically labelled
    Then every form field should have an accessible label

  @regression @positive
  Scenario: No image is missing alternative text
    Then no image should be missing alternative text

  @regression @positive
  Scenario: The login button is reachable using only the keyboard
    Then the login button should be reachable using only the keyboard

  @regression @positive
  Scenario: The keyboard focus order is logical
    Then the keyboard focus order should be username, password, then the login button

  @regression @positive
  Scenario: An accessibility scan produces a report
    When I run an accessibility scan
    Then the scan report should list zero violations
