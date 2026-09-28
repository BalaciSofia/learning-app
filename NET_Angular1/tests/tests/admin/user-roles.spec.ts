import { test, expect } from '@playwright/test';
import * as path from 'path';
import { AdminPage } from '../../pages';
import { createBasicUserFixture, BasicUserFixture } from '../../utils/test-data';
import { registerUserViaUi } from '../../utils/register-helper';

test.use({ storageState: path.resolve(__dirname, '../../.auth/admin.json') });

test.describe('Admin - Assign User Roles', () => {
  let adminPage: AdminPage;
  let basicUser: BasicUserFixture;

  test.beforeEach(async ({ page, browser }) => {
    basicUser = createBasicUserFixture();
    await registerUserViaUi(browser, basicUser);

    adminPage = new AdminPage(page);
    await adminPage.goto();
  });

  test.afterEach(async () => {
    await adminPage.deleteUser(basicUser.email);
  });

  test('Verify if a Basic user can be promoted to Student', async () => {
    await adminPage.selectRole(basicUser.email, 'Student');
    await adminPage.clickSave(basicUser.email);
    const response = await adminPage.confirmPendingRoleChange();

    expect(response.status()).toBe(200);
    expect(await adminPage.isUserInBasicUsers(basicUser.email)).toBe(false);
    expect(await adminPage.getUserRoleBadgeText(basicUser.email)).toBe('Student');
  });

  test('Verify if a Basic user can be promoted to Teacher', async () => {
    await adminPage.selectRole(basicUser.email, 'Teacher');
    await adminPage.clickSave(basicUser.email);
    const response= await adminPage.confirmPendingRoleChange();

    expect(response.status()).toBe(200);
    expect(await adminPage.isUserInBasicUsers(basicUser.email)).toBe(false);
    expect(await adminPage.getUserRoleBadgeText(basicUser.email)).toBe('Teacher');
  });

  test('Verify if cancelling the role change dialog leaves the role unchanged', async () => {
    await adminPage.selectRole(basicUser.email, 'Teacher');
    await adminPage.clickSave(basicUser.email);
    await adminPage.cancelPendingRoleChange();

    expect(await adminPage.isUserInBasicUsers(basicUser.email)).toBe(true);
    expect(await adminPage.getUserRoleBadgeText(basicUser.email)).toBe('Basic');
  });

  test('Verify if saving without selecting a role shows a validation notification', async ({ page }) => {
    await adminPage.clickSave(basicUser.email);

    await expect(page.getByText('Please select a role first.')).toBeVisible();
    expect(await adminPage.isUserInBasicUsers(basicUser.email)).toBe(true);
  });

  test('Verify if the role dropdown only offers Teacher and Student options', async () => {
    const options = await adminPage.getRoleOptionLabels(basicUser.email);
    expect(options).toEqual(['Select role', 'Teacher', 'Student']);
  });

  test('Verify if the success notification shows the correct name and role', async ({ page }) => {
    await adminPage.selectRole(basicUser.email, 'Student');
    await adminPage.clickSave(basicUser.email);
    await adminPage.confirmPendingRoleChange();

    await expect(
      page.getByText(`${basicUser.firstName} ${basicUser.lastName} is now a Student.`)
    ).toBeVisible();
  });
});