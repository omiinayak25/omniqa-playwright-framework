# =====================================================================
#  Feature: DummyJSON Products API
#  Module: API
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify the Products API for retrieval, pagination,
#                       search/filter, sorting, contract (schema) and speed (SLA).
#  Business Value ..... A reliable, fast, well-shaped product API powers every
#                       storefront, search and recommendation feature.
#  Automation Layer ... API (Cucumber-JS → ApiClient → ProductAPI service)
#  Priority ........... High
#  Tags ............... @api @products
#  Related Page Objects none (service layer)
#  Related APIs ....... DummyJSON /products (ProductAPI)
# =====================================================================
@api @products
Feature: DummyJSON Products API
  As an API consumer
  I want to retrieve, page, search and sort products
  So that storefront features can rely on a correct, fast product API

  @smoke @positive @critical
  Scenario: Retrieve a single product by id
    When I request product 1
    Then the response status should be 200
    And the response body should match the "product" schema

  @regression @positive
  Scenario: Products can be paginated with limit and skip
    When I request 5 products skipping 10
    Then the response status should be 200
    And the response should contain 5 products
    And the response body should match the "product list" schema

  @regression @positive
  Scenario: Products can be searched by term
    When I search products for "phone"
    Then the response status should be 200
    And the search should return at least one product

  @regression @positive
  Scenario Outline: Products can be sorted on the server
    When I list products sorted by "<field>" in "<direction>" order
    Then the response status should be 200
    And the products should be sorted by "<field>" in "<direction>" order

    Examples: Sort fields and directions
      | field | direction |
      | title | asc       |
      | title | desc      |

  @regression @performance @perf
  Scenario: The product list responds within the performance budget
    When I request 10 products skipping 0
    Then the response status should be 200
    And the response should arrive within 3000 ms
