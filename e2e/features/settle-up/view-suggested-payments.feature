@settle-up
Feature: View suggested payments

  Scenario: Navigate to settle up from overview
    Given I am on a trip overview with unbalanced expenses
    When I click "Settle up"
    Then I am on the settle up page

  Scenario: Fewest payments shown
    Given I am on the settle up page with at least one suggested payment
    When payments are calculated
    Then the list shows the minimum number of payments to zero all balances

  Scenario: Header states payment and member count
    Given I am on the settle up page with at least one suggested payment
    When I view the header
    Then it states how many payments were found and how many members are in the trip

  Scenario: All balances zero shows empty message
    Given all balances are already at or within 0.005 of zero
    Then I see "All balances are already zero — nothing to settle!"
    And no payment rows are shown
