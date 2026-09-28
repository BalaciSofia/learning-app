import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import * as fs from 'fs';
import * as path from 'path';

// Force all tests in this file to start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

let testUsers: {
  userEmail: string;
  commonPassword: string;
};

test.beforeAll(() => {
  const usersFile = path.resolve(__dirname, '../../.auth/test-users.json');
  if (fs.existsSync(usersFile)) {
    testUsers = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  }
});

test.describe('Default User Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Log in with valid default User credentials', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const responsePromise = apiFlow.waitForLoginResponse();

    await loginPage.login(testUsers.userEmail, testUsers.commonPassword);

    await apiFlow.verifySuccessfulLogin(responsePromise);

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Reject login with an unregistered email/username', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const responsePromise = apiFlow.waitForLoginResponse();

    await loginPage.login('unregistered_user_9999@example.com', 'TestPassword123!');

    await apiFlow.verifyFailedLogin(responsePromise);

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('Prevent user enumeration on non-existent email', async ({ page }) => {
    await loginPage.login('nonexistent@example.com', 'somePassword');
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

});
