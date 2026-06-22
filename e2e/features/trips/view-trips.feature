@trips
Feature: View my trips

  Scenario: Trips listed newest first when trips exist
    Given trips exist
    When I navigate to the trips page
    Then trips are listed in reverse creation order

  Scenario: Positive balance shows You're owed
    Given I have a trip where my balance is positive
    When I view the trips list
    Then the trip card shows "You're owed"

  Scenario: Negative balance shows You owe
    Given I have a trip where my balance is negative
    When I view the trips list
    Then the trip card shows "You owe"

  Scenario: Near-zero balance shows Settled
    Given I have a trip where my balance is within €0.005 of zero
    When I view the trips list
    Then the trip card shows "Settled"

  Scenario: Active badge on current date trip
    Given I have a trip whose date range includes today
    When I view the trips list
    Then the trip card shows an "Active" badge

  Scenario: Empty state message when no trips
    Given no trips exist
    When I navigate to the trips page
    Then I see "No trips yet — create your first one."

  Scenario: Subtitle shows trip count and active count
    Given trips exist
    When I view the trips page subtitle
    Then it shows the total trip count and active count
