/// <reference types="node" /> 
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import * as fs from 'fs';
import * as path from 'path';

// Force all tests in this file to start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

let testUsers: {
  studentEmail: string;
  commonPassword: string;
};

test.beforeAll(() => {
  const usersFile = path.resolve(__dirname, '../../.auth/test-users.json');
  if (fs.existsSync(usersFile)) {
    testUsers = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  }
});

test.describe('Student Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Log in with valid Student credentials', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const responsePromise = apiFlow.waitForLoginResponse();

    await loginPage.login(testUsers.studentEmail, testUsers.commonPassword);

    await apiFlow.verifySuccessfulLogin(responsePromise);

    await expect(page).toHaveURL(/.*dashboard/);
  });

});
