import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages';
import { ADMIN_CREDENTIALS } from '../../utils/credentials';
import { ApiFlow } from '../../api/api-flow';

// Force all tests in this file to start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Admin Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Log in with valid Admin credentials', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const responsePromise = apiFlow.waitForLoginResponse();

    await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);

    await apiFlow.verifySuccessfulLogin(responsePromise);

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Reject login with valid Admin email but incorrect password', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const responsePromise = apiFlow.waitForLoginResponse();

    await loginPage.login(ADMIN_CREDENTIALS.email, 'WrongPassword123!');

    await apiFlow.verifyFailedLogin(responsePromise);

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('Prevent user enumeration on invalid password', async ({ page }) => {
    await loginPage.login(ADMIN_CREDENTIALS.email, 'wrongPassword');
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

});
