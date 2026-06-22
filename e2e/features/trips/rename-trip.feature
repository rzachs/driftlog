@trips
Feature: Rename a trip

  Background:
    Given I am on a trip overview

  Scenario: Trip name becomes editable on click
    When I click the trip name
    Then the trip name field is editable

  Scenario: Rename saves on Enter
    When I click the trip name
    And I clear the name and type "Renamed Trip"
    And I press Enter
    Then the trip name displayed is "Renamed Trip"

  Scenario: Rename saves on blur
    When I click the trip name
    And I clear the name and type "Blurred Name"
    And I click away from the name field
    Then the trip name displayed is "Blurred Name"

  Scenario: Escape reverts to original name
    When I click the trip name
    And I clear the name and type "Should Not Save"
    And I press Escape
    Then the trip name displayed is the original name

  Scenario: Clearing name on blur reverts to original
    When I click the trip name
    And I clear the name entirely
    And I click away from the name field
    Then the trip name displayed is the original name

  Scenario: Page title updates after rename
    When I click the trip name
    And I clear the name and type "Title Test"
    And I press Enter
    Then the browser tab title contains "Title Test"
