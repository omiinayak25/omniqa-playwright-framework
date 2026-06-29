# =====================================================================
#  Feature: Negative & Boundary API Behaviour
#  Module: API
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify the APIs fail gracefully: not-found returns 404,
#                       empty searches return an empty set (not an error), and
#                       responses carry the expected headers.
#  Business Value ..... Predictable error handling prevents broken UIs and makes
#                       client integrations robust.
#  Automation Layer ... API (Cucumber-JS → ApiClient → domain services)
#  Priority ........... High
#  Tags ............... @api @negative
#  Related APIs ....... DummyJSON, Restful-Booker, Swagger Petstore
# =====================================================================
@api @negative
Feature: Negative & Boundary API Behaviour
  As an API consumer
  I want the APIs to fail gracefully and predictably
  So that client applications can handle errors safely

  @regression @negative @high
  Scenario: Requesting a non-existent product returns 404
    When I request product 0
    Then the response status should be 404

  @regression @negative
  Scenario: Searching for an unmatched term returns an empty set, not an error
    When I search products for "zzqxnotarealproduct"
    Then the response status should be 200
    And the response should contain 0 products

  @regression @negative @high
  Scenario: Requesting a non-existent booking returns 404
    When I request a non-existent booking
    Then the response status should be 404

  @regression @positive
  Scenario: A product response carries a content-type header
    When I request product 1
    Then the response should include a "content-type" header
