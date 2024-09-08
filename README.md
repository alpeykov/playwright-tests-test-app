# Playwright Tests for Test App
This project contains end-to-end (E2E) tests written in JavaScript using the Playwright framework. These tests are designed to validate various functionalities of the Test App through user interactions in a simulated browser environment.

## Logs
This project also includes functionality for logging test information. Logs are saved in `./logs/log_tests.txt` and include details about each test execution.

## Prerequisits & Setup
- Setup the [test app](https://github.com/alpeykov/test-app/blob/master/README.md) locally 
- Visit http://localhost:3000/
- npm install
- npx playwright install

# Running the Tests
- npm test

**Notes**
- These tests simulate user actions in a real browser environment using Playwright, ensuring that the application behaves as expected when interacting with the frontend.
- Make sure that the Test App is running on http://localhost:3000/ before running the tests.

**Test Descriptions**
- #1 Registration
Registers a new user in the Test App using the registration form.

- #2 Login
Logs in with the newly created user credentials.

- #3 Logout
Logs out the currently logged-in user, closing the active session.

- #4 Navbar for Logged-in User
Asserts that the navigation bar items for a logged-in user are displayed according to the requirements.

- #5 Navbar for Guest User
Asserts that the navigation bar items for a guest user (not logged-in user) are displayed correctly.

- #6 Create Item
Creates a new item, filling in all required fields.

- #7 Edit Item
Edits the details of an existing item.

- #8 Delete Item
Deletes the last created item and confirms the deletion.

