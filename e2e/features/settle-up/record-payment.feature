@settle-up
Feature: Record a payment

  Background:
    Given I am on the settle up page with at least one suggested payment

  Scenario: Record payment marks row as settled
    When I click "Record payment" on the first suggested payment
    Then the row shows a checkmark and "Undo" button
    And the row is visually dimmed

  Scenario: All payments recorded shows confirmation banner
    When I record all suggested payments
    Then the "All settled up" banner appears

  Scenario: Subtitle shows recorded count
    When I record one of multiple payments
    Then the subtitle shows "1 of N recorded"
