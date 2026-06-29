# =====================================================================
#  Feature: SauceDemo Checkout
#  Module: Checkout
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify the end-to-end checkout: customer details,
#                       validation, order overview totals, completion, and cancel.
#  Business Value ..... Checkout is the revenue moment; broken validation or
#                       wrong totals directly cause failed or incorrect orders.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects + CheckoutFlow)
#  Priority ........... Critical
#  Tags ............... @ui @saucedemo @checkout
#  Related Components . SauceHeaderComponent
#  Related Page Objects SauceInventoryPage, SauceCartPage, CheckoutInfoPage,
#                       CheckoutOverviewPage, CheckoutCompletePage
#  Related APIs ....... none
# =====================================================================
@ui @saucedemo @checkout
Feature: SauceDemo Checkout
  As a signed-in SauceDemo shopper
  I want to check out the products in my cart
  So that I can complete my purchase

  # Reach the customer-information step with one product already in the cart.
  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I add "Sauce Labs Backpack" to the cart
    And I open the cart
    And I proceed to checkout

  @smoke @positive @critical
  Scenario: A shopper completes checkout successfully
    When I enter valid checkout details
    And I continue to the order overview
    Then the order overview should list "Sauce Labs Backpack"
    When I finish the order
    Then I should see the order confirmation "Thank you for your order"

  @regression @negative @high
  Scenario Outline: Checkout requires all customer details
    When I enter checkout details with first name "<first>", last name "<last>" and postal code "<zip>"
    And I continue to the order overview
    Then I should see a checkout error containing "<message>"

    Examples: Missing required fields
      | first | last | zip    | message                 |
      |       | Doe  | 560001 | First Name is required  |
      | Jane  |      | 560001 | Last Name is required   |
      | Jane  | Doe  |        | Postal Code is required |

  @regression @positive
  Scenario: The order overview totals are arithmetically correct
    When I enter valid checkout details
    And I continue to the order overview
    Then the order total should equal the subtotal plus tax

  @regression @positive
  Scenario: After finishing an order the shopper can return to the catalog
    When I enter valid checkout details
    And I continue to the order overview
    And I finish the order
    Then I should see the order confirmation "Thank you for your order"
    When I go back to the products
    Then I should see the product catalog

  @regression @negative
  Scenario: A shopper can cancel checkout and keep their cart
    When I cancel the checkout
    Then the cart should contain "Sauce Labs Backpack"
