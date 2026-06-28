# =====================================================================
#  Feature: SauceDemo Shopping Cart
#  Module: Cart
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify shoppers can add, review, remove and retain
#                       products in the cart, with an accurate cart badge.
#  Business Value ..... The cart is where purchase intent is captured; errors
#                       here (wrong counts, lost items) directly lose revenue.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... Critical
#  Tags ............... @ui @saucedemo @cart
#  Related Components . SauceHeaderComponent (cart badge / open cart)
#  Related Page Objects SauceLoginPage, SauceInventoryPage, SauceCartPage
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @cart
Feature: SauceDemo Shopping Cart
  As a signed-in SauceDemo shopper
  I want to manage the products in my cart
  So that I buy exactly what I intend to

  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I should see the product catalog

  @smoke @positive @critical
  Scenario: A shopper can add a product to the cart
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1 item
    When I open the cart
    Then the cart should contain "Sauce Labs Backpack"

  @regression @positive
  Scenario: A shopper can add multiple products to the cart
    When I add the following products to the cart:
      | Sauce Labs Backpack     |
      | Sauce Labs Bike Light   |
      | Sauce Labs Bolt T-Shirt |
    Then the cart badge should show 3 items
    When I open the cart
    Then the cart should contain the following products:
      | Sauce Labs Backpack     |
      | Sauce Labs Bike Light   |
      | Sauce Labs Bolt T-Shirt |

  @regression @positive
  Scenario: A shopper can remove a product from the cart
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I open the cart
    And I remove "Sauce Labs Backpack" from the cart
    Then the cart should contain 1 item
    And the cart should contain "Sauce Labs Bike Light"
    And the cart badge should show 1 item

  @regression @positive
  Scenario: A shopper can empty the cart completely
    When I add the following products to the cart:
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    And I open the cart
    And I remove all products from the cart
    Then the cart should be empty
    And the cart badge should show no items

  @regression @positive
  Scenario: Continue shopping returns the shopper to the catalog
    When I add "Sauce Labs Backpack" to the cart
    And I open the cart
    And I continue shopping
    Then I should see the product catalog

  @regression @positive
  Scenario: The cart badge reflects the number of items added
    Then the cart badge should show no items
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1 item
    When I add "Sauce Labs Bike Light" to the cart
    Then the cart badge should show 2 items

  @regression @positive
  Scenario: The cart keeps its contents while the shopper keeps browsing
    When I add "Sauce Labs Backpack" to the cart
    And I open the cart
    And I continue shopping
    And I open the cart
    Then the cart should contain "Sauce Labs Backpack"
    And the cart badge should show 1 item
