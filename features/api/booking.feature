# --------------------------------------------------------
# Feature File: booking-api.feature
# Project: OMNIQA Playwright Framework
# Purpose: BDD coverage of Restful-Booker booking create/retrieve/delete flows.
# Strategy: Scenario + Data Table + Doc String
# Tags: @api @booking @smoke @regression
# Last Updated: 2026-06-27
# --------------------------------------------------------
@api @booking
Feature: Restful-Booker booking management
  As an API consumer
  I want to manage bookings
  So that reservations stay accurate

  @smoke
  Scenario: Create and retrieve a booking (Data Table)
    Given I have a valid Booker auth token
    When I create a booking with the following details:
      | firstname    | Gherkin     |
      | lastname     | Tester      |
      | totalprice   | 320         |
      | depositpaid  | true        |
      | checkin      | 2026-09-01  |
      | checkout     | 2026-09-07  |
    Then the booking should be created successfully
    And the stored booking firstname should be "Gherkin"

  @regression
  Scenario: Create a booking with additional needs (Doc String)
    Given I have a valid Booker auth token
    When I create a booking for "Doc" "String" with additional needs:
      """
      Late checkout, extra towels, and a sea-view room if available.
      """
    Then the booking should be created successfully
    And the stored booking should include those additional needs

  @regression
  Scenario: Deleting a booking removes it
    Given I have a valid Booker auth token
    And a booking exists for "Temp" "Record"
    When I delete that booking
    Then the booking should no longer be retrievable
