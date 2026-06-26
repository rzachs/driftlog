@expenses
Feature: Delete an expense

  Scenario: Delete control shows confirmation dialog
    Given expenses exist on the trip
    When I click the expense actions menu on the first expense
    And I click "Delete expense"
    Then a delete expense confirmation dialog appears

  Scenario: Confirming deletion removes the expense from the list
    Given expenses exist on the trip
    When I click the expense actions menu on the first expense
    And I click "Delete expense"
    And I confirm the expense deletion
    Then "First expense" no longer appears in the expense list

  Scenario: Cancelling deletion leaves the expense unchanged
    Given expenses exist on the trip
    When I click the expense actions menu on the first expense
    And I click "Delete expense"
    And I cancel the expense deletion
    Then "First expense" appears in the expense list

  Scenario: Expense count and total update after deletion
    Given expenses exist on the trip
    When I click the expense actions menu on the first expense
    And I click "Delete expense"
    And I confirm the expense deletion
    Then the expense summary shows 1 expense

  Scenario: Balances recalculate after deletion
    Given expenses exist on the trip
    When I click the expense actions menu on the first expense
    And I click "Delete expense"
    And I confirm the expense deletion
    Then the balance cards show updated amounts
