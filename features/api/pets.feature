# =====================================================================
#  Feature: Swagger Petstore Pet API
#  Module: API
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify Pet API full lifecycle (request chaining) and
#                       status filtering with contract validation.
#  Business Value ..... Demonstrates create→read→update→delete chaining where
#                       each step depends on the previous one's data.
#  Automation Layer ... API (Cucumber-JS → ApiClient → PetAPI service)
#  Priority ........... Medium
#  Tags ............... @api @pets
#  Related APIs ....... Swagger Petstore /pet (PetAPI)
# =====================================================================
@api @pets
Feature: Swagger Petstore Pet API
  As an API consumer
  I want to manage a pet through its whole lifecycle
  So that dependent create/read/update/delete operations stay consistent

  @smoke @positive
  Scenario: Filter pets by availability status
    When I find pets with status "available"
    Then the response status should be 200
    And every returned pet should have status "available"

  @regression @positive @critical
  Scenario: A pet can be created, read, updated and deleted (request chaining)
    When I create a pet named "OmniQA Rex"
    Then the response status should be 200
    And the pet should be named "OmniQA Rex"
    When I request that pet
    Then the response status should be 200
    And the response body should match the "pet" schema
    When I update that pet's status to "sold"
    Then the response status should be 200
    And the pet status should be "sold"
    When I delete that pet
    Then the response should be successful
