# =====================================================================
#  Feature: SauceDemo Product Detail Page
#  Module: Inventory
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify a shopper can open a product's detail page and
#                       add it to the cart from there.
#  Business Value ..... The PDP is where purchase intent forms; it must show the
#                       right product and let the shopper add it to the cart.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... High
#  Tags ............... @ui @saucedemo @inventory
#  Related Page Objects SauceInventoryPage, SauceProductDetailsPage
# =====================================================================
@ui @saucedemo @inventory
Feature: SauceDemo Product Detail Page
  As a signed-in SauceDemo shopper
  I want to open a product and add it to my cart from its detail page
  So that I can review and buy the exact product I want

  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I should see the product catalog

  @regression @positive
  Scenario: Opening a product shows its detail page
    When I open the product "Sauce Labs Backpack"
    Then I should see the product details for "Sauce Labs Backpack"

  @regression @positive
  Scenario: A shopper adds a product to the cart from its detail page
    When I open the product "Sauce Labs Backpack"
    And I add the displayed product to the cart
    Then the cart badge should show 1
