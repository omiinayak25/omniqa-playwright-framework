# =====================================================================
#  Feature: ReqRes Users API
#  Module: API
#  Project: OMNIQA Playwright Framework
#
#  Purpose ............ Verify Users API pagination, retrieval, CRUD and the
#                       required API-key header handling.
#  Business Value ..... User management underpins accounts, admin and CRM tools.
#  Automation Layer ... API (Cucumber-JS → ApiClient[x-api-key] → UserAPI)
#  Priority ........... Medium
#  Tags ............... @api @users
#  Related APIs ....... ReqRes /users (UserAPI; x-api-key injected by ApiClient)
# =====================================================================
# NOTE (@wip): As of 2026-06-28 the public ReqRes service returns HTTP 401 to
# ALL requests — even with the documented free key `reqres-free-v1` (verified via
# curl). The steps and wiring below are correct (x-api-key is injected by
# ApiClient); these scenarios will pass once ReqRes accepts the key again.
# Tagged @wip so the green suite excludes them: `--tags '@api and not @wip'`.
@api @users @wip
Feature: ReqRes Users API
  As an API consumer
  I want to page, read and manage users
  So that account and admin features behave predictably

  @smoke @positive
  Scenario: List users with pagination metadata
    When I request the user list for page 2
    Then the response status should be 200
    And the user list should include pagination metadata

  @regression @positive
  Scenario: Retrieve a single user by id
    When I request user 2
    Then the response status should be 200

  @regression @positive
  Scenario: Create a new user
    When I create a user named "OmniQA" with job "QA Architect"
    Then the response status should be 201
    And the created user should have an id

  @regression @positive
  Scenario: Update an existing user
    When I update user 2 to job "Lead SDET"
    Then the response status should be 200

  @regression @positive
  Scenario: Delete a user
    When I delete user 2
    Then the response status should be 204
