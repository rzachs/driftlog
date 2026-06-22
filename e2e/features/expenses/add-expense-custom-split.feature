@expenses
Feature: Add an expense with custom split

  Background:
    Given I am on the add expense form for a trip
    And I select "Custom amounts"

  Scenario: Custom amounts mode shows editable fields
    Then each included member shows their equal share amount

  Scenario: Fully allocated shows green status
    When I fill in amount "90"
    And I enter "30" for "You"
    And I enter "30" for "Maya"
    And I enter "30" for "Sam"
    Then the form shows "Fully allocated" in green

  Scenario: Under-allocated shows red remainder
    When I fill in amount "90"
    And I enter "30" for "You"
    And I enter "30" for "Maya"
    Then the form shows the unallocated remainder in red

  Scenario: Over-allocated shows red over-amount
    When I fill in amount "90"
    And I enter "40" for "You"
    And I enter "40" for "Maya"
    And I enter "40" for "Sam"
    Then the form shows the over-allocated amount in red

  Scenario: Deselecting member disables their field
    When I deselect "Sam"
    Then "Sam"'s amount field is disabled
    And "Sam"'s amount is excluded from the sum

  Scenario: Custom split expense updates balances correctly
    When I fill in amount "90"
    And I enter "60" for "You"
    And I enter "30" for "Maya"
    And I click "Add expense" with description "Custom Test" and date "2026-01-03"
    Then I am on the trip overview
    And each member's balance reflects their specific entered amount

  @wip
  Scenario: Splits not summing to total - spec gap
    When I fill in amount "90"
    And I enter "40" for "You"
    And I enter "40" for "Maya"
    And I click "Add expense" with description "Gap Test" and date "2026-01-03"
    Then the expense is not submitted
