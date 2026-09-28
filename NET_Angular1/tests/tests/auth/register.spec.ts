import { test, expect, Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { RegisterPage, AdminPage } from '../../pages';
import { createValidUserData, INVALID_REGISTER_DATA } from '../../fixtures/register-data.fixture';
import { ApiAddresses } from '../../api/api-addresses';

async function cleanupUser(browser: Browser, email: string): Promise<void> {
  const authPath = path.resolve(__dirname, '../../.auth/admin.json');
  if (fs.existsSync(authPath)) {
    const adminContext = await browser.newContext({ storageState: authPath });
    const adminPage = new AdminPage(await adminContext.newPage());
    await adminPage.goto();
    await adminPage.deleteUser(email);
    await adminContext.close();
  }
}

test.describe('Register Page - Functional & UI Tests', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('Verify that a new user can successfully register with valid data and is redirected to login', async ({ page, browser }) => {
    const userData = createValidUserData();

    const registerApiPromise = page.waitForResponse(
      (response) =>
        response.url().includes('register') &&
        response.request().method() === 'POST' &&
        response.status() === 201
    );

    await registerPage.registerUser(userData);

    expect((await registerApiPromise).status()).toBe(201);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));

    await cleanupUser(browser, userData.email);
  });

  test('Verify that an error message is displayed when password and confirm password do not match', async () => {
    const { password, confirmPassword } = INVALID_REGISTER_DATA.mismatchedPasswords;

    await registerPage.fillPassword(password);
    await registerPage.fillConfirmPassword(confirmPassword);
    await registerPage.blurFirstNameField();

    await registerPage.expectValidationErrorIsVisible();
  });

  test('Verify that a validation error is displayed when entering an invalid email format', async () => {
    await registerPage.fillEmail(INVALID_REGISTER_DATA.invalidEmail);
    await registerPage.blurFirstNameField();

    await registerPage.expectValidationErrorIsVisible();
  });

  test('Verify that a validation error is displayed when entering a weak password', async () => {
    await registerPage.fillPassword(INVALID_REGISTER_DATA.weakPassword);
    await registerPage.blurFirstNameField();

    await registerPage.expectValidationErrorIsVisible();
  });

  test('Verify that an error message is displayed when attempting to register with an already existing email', async ({ page, browser }) => {
    const userData = createValidUserData();

    await registerPage.registerUser(userData);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));

    await registerPage.goto();

    const registerApiPromise = page.waitForResponse(
      (res) => res.url().includes('register') && res.request().method() === 'POST'
    );

    await registerPage.registerUser(userData);

    expect((await registerApiPromise).status()).toBe(400);

    await registerPage.expectServerErrorMessageIsVisible();

    await cleanupUser(browser, userData.email);
  });

  test('Verify that clicking the show/hide password button toggles input field type between password and text', async () => {
    await registerPage.expectPasswordInputType('password');
    await registerPage.togglePasswordVisibility();
    await registerPage.expectPasswordInputType('text');
  });
});