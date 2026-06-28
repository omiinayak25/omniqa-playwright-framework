# =====================================================================
#  Feature: SauceDemo Checkout Overview
#  Module: Checkout
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify the order overview (step two): tax arithmetic,
#                       payment/shipping information, and cancelling the order.
#  Business Value ..... The overview is the shopper's last review before paying;
#                       wrong tax or missing info erodes trust and loses sales.
#  Automation Layer ... UI (Cucumber-JS → SauceDemo Page Objects)
#  Priority ........... High
#  Tags ............... @ui @saucedemo @checkout
#  Related Page Objects CheckoutInfoPage, CheckoutOverviewPage
# =====================================================================
@ui @saucedemo @checkout
Feature: SauceDemo Checkout Overview
  As a signed-in SauceDemo shopper
  I want to review my order before paying
  So that I can confirm the items, totals, and details are correct

  Background:
    Given I am on the SauceDemo login page
    And I sign in with valid credentials
    And I add "Sauce Labs Backpack" to the cart
    And I open the cart
    And I proceed to checkout
    And I enter valid checkout details
    And I continue to the order overview

  @regression @positive
  Scenario: The tax is 8% of the subtotal
    Then the tax should be 8% of the subtotal

  @regression @positive
  Scenario: The overview shows payment and shipping information
    Then the overview should show payment and shipping information

  @regression @negative
  Scenario: Cancelling from the overview returns the shopper to the catalog
    When I cancel the order from the overview
    Then I should see the product catalog
