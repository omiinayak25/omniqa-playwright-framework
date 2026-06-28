# =====================================================================
#  Feature: Booking Lifecycle (multi-step API E2E)
#  Module: End-to-End
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify a booking's full lifecycle through the API:
#                       create → verify → update → delete → confirm deletion.
#  Business Value ..... Reservations must be creatable, amendable and reliably
#                       removable; a booking that "won't delete" is a real risk.
#  Automation Layer ... E2E (API, multi-step / request chaining) via BookingAPI
#  Priority ........... High
#  Tags ............... @e2e @api @booking
#  Related APIs ....... Restful-Booker /booking + /auth (BookingAPI, AuthAPI)
# =====================================================================
@e2e @api @booking
Feature: Booking Lifecycle
  As a reservations system
  I want to create, amend and remove bookings end to end
  So that reservation data stays accurate over its whole life

  Background:
    Given I have a valid Booker auth token

  @smoke @positive @critical
  Scenario: A booking can be created, verified, updated and deleted
    When I create a booking for "Gherkin" "Tester" priced at 320
    Then the booking should be retrievable with first name "Gherkin"
    When I update the booking first name to "Updated" and price to 999
    Then the booking should be retrievable with first name "Updated"
    When I delete the booking
    Then the booking should no longer exist
