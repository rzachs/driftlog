@balances
Feature: View person breakdown

  Background:
    Given I am on a person detail page for a member in a trip with expenses

  Scenario: Person detail shows totals
    Then I see the member's total paid, total share, and net balance

  Scenario: Payer row shows positive net impact
    Given the member paid for an expense
    When I view their breakdown row for that expense
    Then the net impact is positive

  Scenario: Non-payer participant row shows negative net impact
    Given the member did not pay but was included in the split
    When I view their breakdown row
    Then the net impact is negative

  Scenario: Payer who is also participant nets out correctly
    Given the member paid and was split into the expense
    When I view their breakdown row for that expense
    Then the net impact reflects the payer-nets-out rule

  Scenario: Negative balance shows settle up CTA
    Given the member has a negative net balance
    Then a "Settle up" call-to-action is shown linking to the settle up page

  Scenario: Positive balance hides settle up CTA
    Given the member has a positive net balance
    Then no settle up CTA is shown
