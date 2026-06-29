# =====================================================================
#  Feature: Employee Database
#  Module: Database
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify core database behaviour: CRUD, transactions and
#                       rollback, a view, an index, a stored function, and
#                       integrity constraints — via the Repository pattern.
#  Business Value ..... Data integrity is foundational; silent corruption or
#                       broken constraints damage every downstream report/feature.
#  Automation Layer ... Database (Cucumber-JS → QueryRunner / Repositories)
#  Priority ........... High
#  Tags ............... @db @database
#  Related Page Objects none (data layer)
#  Related APIs ....... none — embedded PostgreSQL (PGlite), schema.sql seed
# =====================================================================
@db @database
Feature: Employee Database
  As a data-owning service
  I want employee records to persist correctly and safely
  So that the business can trust its data

  Background:
    Given the automation database is reachable

  Rule: Employees can be created, updated and removed (CRUD)

    @smoke @positive @critical
    Scenario: A new employee can be hired
      When I hire an employee "Grace" "Hopper" in department 2 earning 91000
      Then the new employee should have a positive id
      And an employee with that email should exist

    @regression @positive
    Scenario: An employee's salary can be updated
      When I hire an employee "Pay" "Rise" in department 1 earning 80000
      And I change that employee's salary to 95000
      Then that employee's salary should be 95000

    @regression @positive
    Scenario: An employee can be terminated
      When I hire an employee "Temp" "Worker" in department 3 earning 70000
      And I terminate that employee
      Then no employee with that email should exist

  Rule: Transactions are atomic

    @regression @positive
    Scenario: A failed transaction leaves no trace (ROLLBACK)
      When I insert an employee in a transaction that fails
      Then no employee with that email should exist

    @regression @positive
    Scenario: A successful transaction persists every insert (COMMIT)
      When I insert two employees in a successful transaction
      Then both employees should exist

  Rule: Schema objects behave as designed

    @regression @positive
    Scenario: The active-employees view excludes inactive staff
      Then the active employees view should include "ada.lovelace@example.test"
      And the active employees view should exclude "edsger.dijkstra@example.test"

    @regression @positive
    Scenario: The expected index exists on the employees table
      Then an index named "idx_employees_last_name" should exist on "employees"

    @regression @positive
    Scenario: The stored function applies a percentage raise
      When I hire an employee "Func" "Raise" in department 1 earning 100000
      And I apply a 10 percent raise to that employee via the stored function
      Then the new salary should be 10 percent higher

  Rule: Integrity constraints are enforced

    @regression @negative @high
    Scenario: A non-positive salary is rejected (CHECK constraint)
      When I try to insert an employee with salary -5
      Then the database should reject it

    @regression @negative @high
    Scenario: An unknown department is rejected (foreign key)
      When I try to insert an employee in department 9999
      Then the database should reject it

  Rule: The repository exposes correct aggregates

    @regression @positive
    Scenario: The employee repository counts the seeded staff
      Then the employee repository should report at least 4 employees
