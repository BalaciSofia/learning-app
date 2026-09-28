import { Browser, expect } from '@playwright/test';
import { RegisterPage } from '../pages';
import { RegisterUserData } from '../fixtures/register-data.fixture';

export async function registerUserViaUi(browser: Browser, userData: RegisterUserData): Promise<void> {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.registerUser(userData);
  await expect(page).toHaveURL(/.*login/);

  await context.close();
}