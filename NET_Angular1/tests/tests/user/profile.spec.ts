import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage, ProfilePage, NavBarPage, AdminPage } from '../../pages';
import { ApiAddresses } from '../../api/api-addresses';
import { StudentUser, TeacherUser } from '../../fixtures/user.fixtures';
import { createBasicUserFixture } from '../../utils/test-data';
import { registerUserViaUi } from '../../utils/register-helper';

test.describe('Profile Management, State and Error Handling Tests', () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;
  let navbarPage: NavBarPage;
  let testUsers: { studentEmail: string; teacherEmail: string; commonPassword: string };

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    navbarPage = new NavBarPage(page);

    const testUsersPath = path.resolve(__dirname, '../../.auth/test-users.json');
    expect(fs.existsSync(testUsersPath)).toBeTruthy();
    testUsers = JSON.parse(fs.readFileSync(testUsersPath, 'utf-8'));
  });

  test('Verify if profile data resets and displays correct user info after logging out and logging in with a different user', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.studentEmail, testUsers.commonPassword);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.dashboard));
    await navbarPage.clickMyProfile();
    await profilePage.verifyProfileName(StudentUser.firstName + " " + StudentUser.lastName);
    await profilePage.verifyProfileEmail(testUsers.studentEmail);
    await profilePage.closeProfileDrawer();

    await navbarPage.clickLogout();
    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
    
    await loginPage.goto();
    await loginPage.login(testUsers.teacherEmail, testUsers.commonPassword);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.dashboard));

    await navbarPage.clickMyProfile();
    await profilePage.verifyProfileName(TeacherUser.firstName + " " + TeacherUser.lastName);
    await profilePage.verifyProfileEmail(testUsers.teacherEmail);
  });

  test('Verify navigation to Change Password page from profile drawer', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.studentEmail, testUsers.commonPassword);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.dashboard));

    await navbarPage.clickMyProfile();
    await profilePage.clickChangePassword();

    await expect(page).toHaveURL(/\/change-password/);
  });

  test('Verify canceling account deletion keeps the profile panel and account active', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.studentEmail, testUsers.commonPassword);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.dashboard));

    await navbarPage.clickMyProfile();
    await profilePage.clickDeleteAccount();

    await profilePage.cancelAccountDeletion();

    await profilePage.verifyProfileEmail(testUsers.studentEmail);
  });

  test('Verify if confirming account deletion logs the user out and redirects to login', async ({ page, browser }) => {
    const newUser = createBasicUserFixture();
    await registerUserViaUi(browser, newUser);

    const adminContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/admin.json'),
    });
    const adminPage = new AdminPage(await adminContext.newPage());
    await adminPage.goto();
    await adminPage.changeUserRole(newUser.email, 'Student');
    await adminContext.close();

    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);
    await expect(page).toHaveURL(new RegExp(ApiAddresses.dashboard));

    await navbarPage.clickMyProfile();
    await profilePage.clickDeleteAccount();
    await profilePage.confirmAccountDeletion();

    await expect(page).toHaveURL(new RegExp(ApiAddresses.login));
  });

});