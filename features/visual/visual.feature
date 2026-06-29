# =====================================================================
#  Feature: SauceDemo Login Visual Regression
#  Module: Visual
#  Project: OMINQA Playwright Framework
#
#  Purpose ............ Verify the login screen is captured deterministically
#                       against a baseline, with dynamic regions masked.
#  Business Value ..... Unintended visual/CSS changes to the first screen users
#                       see must be caught before release.
#  Automation Layer ... Visual (Cucumber-JS → page.screenshot + freeze CSS + masks)
#  Priority ........... Medium
#  Tags ............... @visual @ui
#  Related Page Objects SauceLoginPage
#  Related APIs ....... none
#
#  NOTE: Pixel-perfect, CROSS-BROWSER, per-OS baseline comparison is performed by
#  the Playwright runner (tests/visual/** → *-snapshots/<name>-<project>-<platform>.png),
#  which owns `toHaveScreenshot`. Cucumber has no such matcher, so this BDD module
#  reuses the SAME stabilisation (freeze stylesheet) and dynamic-region masking to
#  capture deterministic screenshots and manage a baseline on a single browser.
# =====================================================================
@visual @ui
Feature: SauceDemo Login Visual Regression
  As a release manager
  I want the login screen captured deterministically against a baseline
  So that unintended visual changes are caught before release

  Background:
    Given I am on the SauceDemo login page

  @smoke @positive
  Scenario: A visual baseline of the login page is established
    When I capture the login page as the "saucedemo-login-bdd" baseline
    Then a visual baseline should exist for "saucedemo-login-bdd"

  @regression @positive
  Scenario: Stabilised captures are pixel-stable (regression-ready)
    When I capture the login page twice
    Then both captures should be pixel-identical

  @regression @positive
  Scenario: Dynamic regions are masked out of the capture
    When I capture the login page masking dynamic regions
    Then a masked capture should be produced
