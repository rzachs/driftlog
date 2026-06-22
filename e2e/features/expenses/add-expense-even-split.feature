@expenses
Feature: Add an expense with even split

  Scenario: Navigate to add expense from overview
    Given I am on the trip overview
    When I click "Add expense"
    Then I am on the add expense form

  Scenario: Even-split expense creates and returns to overview
    Given I am on the add expense form for a trip
    When I fill in amount "60", description "Test Dinner", payer "You", date "2026-01-03"
    And I click "Add expense"
    Then I am on the trip overview
    And "Test Dinner" appears in the expense list

  Scenario: Deselecting members splits only among selected
    Given I am on the add expense form for a trip
    When I deselect all members except "You" and "Maya"
    And I fill in amount "50"
    Then each included member shows their equal share

  Scenario: Share amounts shown in people list
    Given I am on the add expense form for a trip
    When I fill in amount "90" with "Split evenly" selected
    Then each included member shows their equal share amount

  Scenario: New expense appears in overview with updated balances
    Given I am on the add expense form for a trip
    When I fill in amount "60", description "Test Dinner", payer "You", date "2026-01-03"
    And I click "Add expense"
    Then "Test Dinner" appears in the expense list
    And each member's balance card reflects the split

  Scenario: Missing required field blocks submission
    Given I am on the add expense form for a trip
    When I click "Add expense" without filling in amount
    Then I remain on the add expense form

  Scenario: Cancel returns to overview without creating expense
    Given I am on the add expense form for a trip
    When I click "Cancel"
    Then I am on the trip overview
    And no new expense was created

  @wip
  Scenario: No members selected - spec gap
    Given I am on the add expense form for a trip
    When I deselect all members
    And I fill in amount "50"
    And I click "Add expense" without filling in amount
    Then the expense is not submitted
