@auth
Feature: Login with Google

  Scenario: Login page shows only the Google sign-in button
    Given I am on the login page and not logged in
    Then I see only the Google sign-in button with no other auth options

  Scenario: Google button redirects to consent screen
    Given I am on the login page and not logged in
    When I click the Google sign-in button
    Then I am redirected to Google's OAuth consent screen

  Scenario: Successful consent logs in and redirects to trips
    Given I have completed Google's OAuth consent
    When Google redirects me back to Driftlog
    Then I am logged in and taken to /trips

  Scenario: First-time user gets a new account
    Given I am a first-time Google user
    When I complete login
    Then a Driftlog account is created from my Google profile

  Scenario: Returning user is signed in to existing account
    Given I am a returning Google user
    When I complete login
    Then I am signed in to my existing account with profile synced

  Scenario: Already logged in redirects to trips
    Given I am already logged in
    When I navigate to /login
    Then I am redirected to /trips without OAuth

  Scenario: Cancelling consent shows error message
    Given I have cancelled on Google's consent screen
    When I am redirected back to Driftlog
    Then I see an error message on the login page
    And I remain logged out

  Scenario: OAuth error shows error message
    Given Google has returned an OAuth error on the callback
    When Driftlog processes the callback
    Then I see an error message on the login page
    And I remain logged out
