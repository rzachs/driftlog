@trips
Feature: Create a trip

  Background:
    Given I am on the trips page

  Scenario: Modal opens on Create trip click
    When I click "Create trip"
    Then a modal appears with fields for trip name, start date, end date, and people

  Scenario: Trip created with name navigates to overview
    When I click "Create trip"
    And I enter trip name "E2E Barcelona"
    And I click the modal "Create trip" button
    Then I am on the trip overview for "E2E Barcelona"

  Scenario: Submit without name does not create trip
    When I click "Create trip"
    And I click the modal "Create trip" button without entering a name
    Then no new trip is created

  Scenario: Add person by name and Enter
    When I click "Create trip"
    And I type "Lena" in the people field and press Enter
    Then "Lena" appears in the people list

  Scenario: Remove a person excludes them from trip
    When I click "Create trip"
    And I remove "Sam" from the people list
    And I enter trip name "E2E Solo"
    And I click the modal "Create trip" button
    Then the created trip does not include "Sam" as a member

  Scenario: Cancel closes modal without creating trip
    When I click "Create trip"
    And I click "Cancel"
    Then the modal is closed
    And no new trip is created

  Scenario: Backdrop click closes modal
    When I click "Create trip"
    And I click the modal backdrop
    Then the modal is closed

  Scenario: You is always included as member
    When I click "Create trip"
    And I enter trip name "E2E You Always"
    And I click the modal "Create trip" button
    Then the created trip includes "You" as a member
