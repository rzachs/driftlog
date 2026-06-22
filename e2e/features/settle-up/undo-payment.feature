@settle-up
Feature: Undo a recorded payment

  Background:
    Given I am on the settle up page with at least one recorded payment

  Scenario: Undo reverts payment to unrecorded
    When I click "Undo" on a recorded payment
    Then the payment returns to the unrecorded state and the "Record payment" button reappears

  Scenario: Undo decrements the recorded count
    When I click "Undo" on a recorded payment
    Then the subtitle recorded count decreases by one

  Scenario: Undoing last recorded payment removes All settled up banner
    Given all payments were recorded
    When I click "Undo" on a recorded payment
    Then the "All settled up" banner disappears
