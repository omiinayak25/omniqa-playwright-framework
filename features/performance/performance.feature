# =====================================================================
#  Feature: SauceDemo Login Performance
#  Module: Performance
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify the login screen loads within budget and capture
#                       page-load, response-time and resource-timing metrics.
#  Business Value ..... Slow entry screens lose users; a gross perf regression
#                       (slow TTFB, bloated payload) must fail the build.
#  Automation Layer ... Performance (Cucumber-JS → PerformanceCollector)
#  Priority ........... Medium
#  Tags ............... @performance @perf @ui
#  Related Page Objects SauceLoginPage
#  Related APIs ....... none
#
#  NOTE: Lighthouse audits require a separately-launched Chrome and
#  LIGHTHOUSE_ENABLED=true; they are owned by the Playwright runner
#  (tests/performance/lighthouse.perf.spec.ts) and intentionally not run here.
# =====================================================================
@performance @perf @ui
Feature: SauceDemo Login Performance
  As a performance-conscious team
  I want the login screen to load quickly and stay within budget
  So that users are not lost to slowness

  Background:
    Given I am on the SauceDemo login page
    And I measure the login page performance

  @smoke @positive
  Scenario: The login page loads within the page-load budget
    Then the page should load within 5000 ms

  @regression @positive
  Scenario: The login page stays within the full performance budget
    Then the page should load within the configured performance budget

  @regression @positive
  Scenario: Time to first byte is acceptable
    Then the time to first byte should be under 1500 ms

  @regression @positive
  Scenario: Resource timing is captured
    Then the page should request at least 1 resource
    And the total transferred size should be under 2048 kilobytes
    And a per-resource-type breakdown should be available
