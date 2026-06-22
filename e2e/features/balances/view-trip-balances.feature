@balances
Feature: View trip balances

  Background:
    Given I am on a trip overview with members and expenses

  Scenario: Balance cards show all members
    When the balances section loads
    Then each member is shown as a card with their name and balance amount

  Scenario: Positive balance card has green accent
    Given a member has a positive balance
    When I view their balance card
    Then the card has a green accent and shows "Is owed"

  Scenario: You are owed label for current user
    Given my balance is positive
    When I view my balance card
    Then the card has a green accent and shows "You are owed"

  Scenario: Negative balance card has red accent
    Given a member has a negative balance
    When I view their balance card
    Then the card has a red accent and shows "Owes the group"

  Scenario: Clicking balance card navigates to person detail
    When I click a member's balance card
    Then I am on the person detail page
    And the URL matches /trips/:id/members/:memberId

  @wip
  Scenario: Zero balance card display - spec gap
    Given a member has exactly zero balance
    When I view their balance card
    Then the card has a green accent and shows "Is owed"
