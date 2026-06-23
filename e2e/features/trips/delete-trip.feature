@trips
Feature: Delete a trip

  Scenario: Delete confirmation appears from trips list [AC: list delete control]
    Given trips exist
    When I click the delete button on a trip row
    Then a delete confirmation dialog appears

  Scenario: Confirm deletion removes trip from list [AC: confirm + list disappears]
    Given trips exist
    When I click the delete button on a trip row
    And I confirm deletion
    Then the trip is no longer in the list

  Scenario: Cancel deletion leaves trip unchanged [AC: cancel]
    Given trips exist
    When I click the delete button on a trip row
    And I cancel deletion
    Then the modal is closed
    And the trip is still in the list

  Scenario: Delete confirmation appears from trip overview [AC: overview delete control]
    Given I am on a trip overview
    When I click "More actions"
    And I click "Delete trip"
    Then a delete confirmation dialog appears

  Scenario: Confirm deletion from overview navigates to trips list [AC: overview confirm]
    Given I am on a trip overview
    When I click "More actions"
    And I click "Delete trip"
    And I confirm deletion
    Then I am on the trips list
