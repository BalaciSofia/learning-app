import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { LoginPage, LogoutPage } from '../../pages';
import { ApiAddresses } from '../../api/api-addresses';

// Each test logs in fresh — never share a session that was logged out
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN_KEY = 'accessToken';

let testUsers: { userEmail: string; commonPassword: string };

test.beforeAll(() => {
  const usersFile = path.resolve(__dirname, '../../.auth/test-users.json');
  if (fs.existsSync(usersFile)) {
    testUsers = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  }
});

async function loginUser(page: Page): Promise<{ loginPage: LoginPage; logoutPage: LogoutPage }> {
  const loginPage = new LoginPage(page);
  const logoutPage = new LogoutPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.userEmail, testUsers.commonPassword);
  await expect(page).toHaveURL(/.*dashboard/);
  return { loginPage, logoutPage };
}

test.describe('Logout - LocalStorage and JWT Management', () => {
  test('Verify that the user is redirected to the login page after clicking logout', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    await logoutPage.clickLogout();

    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
  });

  test('Verify that the JWT token is removed from localStorage after logout', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    await logoutPage.clickLogout();

    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
    const token = await page.evaluate((key: string) => localStorage.getItem(key), TOKEN_KEY);
    expect(token).toBeNull();
  });

  test('Verify that navigating to a protected route redirects to login after logout', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    await logoutPage.clickLogout();

    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
    await page.goto(ApiAddresses.baseUrl + ApiAddresses.dashboard);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
  });

  test('Verify that the logout request reaches the backend and the server returns 204', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    const logoutResponsePromise = page.waitForResponse(
      r => r.url().includes(ApiAddresses.apiLogout) && r.request().method() === 'POST'
    );

    await logoutPage.clickLogout();

    const logoutResponse = await logoutResponsePromise;
    expect(logoutResponse.status()).toBe(204);
  });

  test('Verify that the JWT token is rejected by the backend after logout', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    const tokenBeforeLogout = await page.evaluate(
      (key: string) => localStorage.getItem(key),
      TOKEN_KEY
    );
    expect(tokenBeforeLogout).not.toBeNull();

    const logoutResponsePromise = page.waitForResponse(
      r => r.url().includes(ApiAddresses.apiLogout) && r.request().method() === 'POST'
    );

    await logoutPage.clickLogout();
    await logoutResponsePromise;

    // Use the captured token directly to call a protected endpoint
    const status = await page.evaluate(
      async ({ token, url }: { token: string; url: string }) => {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.status;
      },
      {
        token: tokenBeforeLogout!,
        url: `${ApiAddresses.apiBaseUrl}/api/users/me`,
      }
    );

    expect(status).toBe(401);
  });

  test('Verify that the user can log in again after logging out', async ({ page }) => {
    const { logoutPage } = await loginUser(page);

    await logoutPage.clickLogout();
    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));

    const loginPage = new LoginPage(page);
    await loginPage.login(testUsers.userEmail, testUsers.commonPassword);
    await expect(page).toHaveURL(/.*dashboard/);

    const token = await page.evaluate((key: string) => localStorage.getItem(key), TOKEN_KEY);
    expect(token).not.toBeNull();
  });
});
