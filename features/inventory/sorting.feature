# =====================================================================
#  Feature: SauceDemo Catalog Sorting
#  Module: Inventory
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify shoppers can reorder the catalog by name and by
#                       price, in both ascending and descending directions.
#  Business Value ..... Sorting helps shoppers find products faster (cheapest
#                       first, alphabetical, etc.), improving the buying journey.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... Medium
#  Tags ............... @ui @saucedemo @inventory
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceLoginPage, SauceInventoryPage (ProductSort)
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @inventory
Feature: SauceDemo Catalog Sorting
  As a signed-in SauceDemo shopper
  I want to sort the product catalog
  So that I can find products in the order that suits me

  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I should see the product catalog

  @regression @positive
  Scenario Outline: Shoppers can reorder the catalog
    When I sort the products by "<sort option>"
    Then the products should be ordered by "<expected order>"

    Examples: Sort options
      | sort option         | expected order   |
      | Name (A to Z)       | name ascending   |
      | Name (Z to A)       | name descending  |
      | Price (low to high) | price ascending  |
      | Price (high to low) | price descending |
