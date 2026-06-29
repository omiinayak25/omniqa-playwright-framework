# =====================================================================
#  Feature: API → Database Product Sync (cross-layer E2E)
#  Module: End-to-End
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify a product read from the API (source of truth) is
#                       synced into the database and reconciled, idempotently.
#  Business Value ..... Data pipelines must keep the database faithful to the
#                       upstream API; drift or duplicates corrupt reporting.
#  Automation Layer ... E2E (API + Database) via ProductAPI + ProductRecordRepository
#  Priority ........... High
#  Tags ............... @e2e @db
#  Related APIs ....... DummyJSON /products (ProductAPI)
#  Related Repos ...... ProductRecordRepository (PGlite products table)
# =====================================================================
@e2e @db
Feature: API to Database Product Sync
  As a data pipeline
  I want products from the API to be synced into the database
  So that downstream features read data that faithfully mirrors the source

  Background:
    Given the automation database is reachable

  @smoke @positive @critical
  Scenario: A product read from the API is synced into the database
    When I fetch product 5 from the API
    And I sync that product into the database
    Then the stored product should match the API product

  @regression @positive
  Scenario: Re-syncing the same product does not create a duplicate
    When I fetch product 5 from the API
    And I sync that product into the database
    And I sync that product again with the price increased by 10
    Then the stored product price should reflect the latest sync
