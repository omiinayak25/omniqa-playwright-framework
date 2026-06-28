# =====================================================================
#  Feature: SauceDemo Product Catalog
#  Module: Inventory
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify the product catalog presents every product with
#                       complete, valid details (name, description, price, image).
#  Business Value ..... The catalog is the storefront; missing prices, images or
#                       descriptions directly reduce trust and lost sales.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... High
#  Tags ............... @ui @saucedemo @inventory
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceLoginPage, SauceInventoryPage
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @inventory
Feature: SauceDemo Product Catalog
  As a signed-in SauceDemo shopper
  I want to browse a complete product catalog
  So that I can decide what to buy with confidence

  # Reuses the Authentication steps to reach an authenticated catalog.
  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I should see the product catalog

  @smoke @positive @critical
  Scenario: The catalog shows all available products
    Then I should see 6 products available

  @regression @positive
  Scenario: Every product shows complete details
    Then every product should display a name, a description and a price

  @regression @positive
  Scenario: Every product displays an image
    Then every product should display an image

  @regression @positive
  Scenario: Every product has a valid, positive price
    Then every product price should be greater than zero

  @regression @positive
  Scenario: Every product has a meaningful description
    Then every product should display a non-empty description
