import { test, expect } from '@playwright/test';
import * as path from 'path';
import { AdminPage, LoginPage } from '../../pages';
import { createBasicUserFixture, BasicUserFixture } from '../../utils/test-data';
import { registerUserViaUi } from '../../utils/register-helper';

test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

test.describe('Admin - Delete User', () => {
  let adminPage: AdminPage;
  let basicUser: BasicUserFixture;

  test.beforeEach(async ({ page, browser }) => {
    basicUser = createBasicUserFixture();
    await registerUserViaUi(browser, basicUser);

    adminPage = new AdminPage(page);
    await adminPage.goto();
  });

  test('Verify if an admin can delete a user from the All Users tab', async () => {
    await adminPage.clickDeleteButton(basicUser.email);
    await adminPage.confirmPendingUserDelete();
    await adminPage.waitForDeleteSuccessToast(basicUser.firstName, basicUser.lastName);

    expect(await adminPage.isUserInAllUsers(basicUser.email)).toBe(false);
  });

  test('Verify if cancelling the delete confirmation keeps the user in the list', async () => {
    await adminPage.clickDeleteButton(basicUser.email);
    await adminPage.cancelPendingUserDelete();

    expect(await adminPage.isUserInAllUsers(basicUser.email)).toBe(true);

    await adminPage.deleteUser(basicUser.email);
  });

  test('Verify if a deleted user also disappears from the Basic Users tab', async () => {
    await adminPage.clickDeleteButton(basicUser.email);
    await adminPage.confirmPendingUserDelete();
    await adminPage.waitForDeleteSuccessToast(basicUser.firstName, basicUser.lastName);

    expect(await adminPage.isUserInBasicUsers(basicUser.email)).toBe(false);
  });

  test('Verify if the success notification shows the correct user name', async () => {
    await adminPage.clickDeleteButton(basicUser.email);
    await adminPage.confirmPendingUserDelete();

    await adminPage.waitForDeleteSuccessToast(basicUser.firstName, basicUser.lastName);
  });

  test('Verify if a deleted user can no longer log in', async ({ browser }) => {
    await adminPage.clickDeleteButton(basicUser.email);
    await adminPage.confirmPendingUserDelete();
    await adminPage.waitForDeleteSuccessToast(basicUser.firstName, basicUser.lastName);

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const guestPage = await context.newPage();
    const loginPage = new LoginPage(guestPage);

    await loginPage.goto();
    await loginPage.login(basicUser.email, basicUser.password);

    await expect(guestPage.getByText('Invalid email or password.')).toBeVisible();

    await context.close();
  });
});
