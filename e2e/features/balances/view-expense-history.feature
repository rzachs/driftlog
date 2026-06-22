@balances
Feature: View expense history

  Scenario: Expenses listed in reverse chronological order
    Given expenses exist on the trip
    When the expense list loads
    Then expenses are listed with most recent date first

  Scenario: Each expense row shows required fields
    Given expenses exist on the trip
    When I view an expense in the list
    Then it shows the description, date, who paid, split count, and total amount

  Scenario: Empty state when no expenses
    Given no expenses exist on the trip
    When I view the expense list section
    Then I see "No expenses yet."

  Scenario: Summary shows total count and sum
    Given expenses exist on the trip
    When I view the summary above the expense list
    Then it shows the total number of expenses and the sum of all amounts
