@auth
Feature: Logout

  Scenario: Open account menu shows user info and log out button
    Given I am logged in
    When I open the account menu
    Then I see the account dropdown with my name and email

  Scenario: Clicking outside the menu closes it without logging out
    Given I am logged in
    When I open the account menu
    And I click outside the menu
    Then the dropdown closes
    And I am still logged in

  Scenario: Clicking Log out destroys session and redirects to login [AC: redirect + best-effort redirect]
    Given I am logged in
    When I open the account menu
    And I click Log out
    Then I am on the login page
    And my session is gone

  Scenario: Navigating to a protected route after logout redirects to login
    Given I am logged in
    When I open the account menu
    And I click Log out
    And I navigate to /trips
    Then I am on the login page
