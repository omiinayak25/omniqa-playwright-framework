# =====================================================================
#  Feature: JSONPlaceholder Posts API
#  Module: API
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify Posts API CRUD and contract shape.
#  Business Value ..... Content/feed features depend on dependable post CRUD.
#  Automation Layer ... API (Cucumber-JS → ApiClient → PostAPI service)
#  Priority ........... Medium
#  Tags ............... @api @posts
#  Related APIs ....... JSONPlaceholder /posts (PostAPI)
# =====================================================================
@api @posts
Feature: JSONPlaceholder Posts API
  As an API consumer
  I want to create, read, update and delete posts
  So that content features behave predictably

  @smoke @positive
  Scenario: List all posts
    When I request all posts
    Then the response status should be 200
    And the response should contain a non-empty list of posts

  @regression @positive
  Scenario: Retrieve a single post by id
    When I request post 1
    Then the response status should be 200
    And the response body should match the "post" schema

  @regression @positive
  Scenario: Create a new post
    When I create a post titled "OminQA BDD Post"
    Then the response status should be 201
    And the created post should have an id
    And the post title should be "OminQA BDD Post"

  @regression @positive
  Scenario: Update an existing post
    When I update post 1 with title "OminQA Updated"
    Then the response status should be 200
    And the post title should be "OminQA Updated"

  @regression @positive
  Scenario: Delete a post
    When I delete post 1
    Then the response should be successful
