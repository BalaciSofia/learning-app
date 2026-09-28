import { test, expect } from '@playwright/test';
import { ChangePasswordPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import { ApiAddresses } from '../../api/api-addresses';
import * as fs from 'fs';
import * as path from 'path';

test.use({ storageState: path.resolve(__dirname, '../../.auth/user.json') });

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
test.describe.configure({ mode: 'serial' });
test.describe('Change Password Tests', () => {
  let changePasswordPage: ChangePasswordPage;

  test.beforeEach(async ({ page }) => {
    changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.goto();
    await expect(page).toHaveURL(/change-password/);
  });

  test('Happy Path - Change password successfully', async ({ page }) => {
    const apiFlow = new ApiFlow(page);
    const newValidPassword = 'TestNewPass456!';

    const responsePromise = apiFlow.waitForChangePasswordResponse();
    await changePasswordPage.fillAndSubmit(testUsers.commonPassword, newValidPassword, newValidPassword);
    await apiFlow.verifySuccessfulChange(responsePromise);
    await expect(changePasswordPage.successToast).toContainText('Password changed successfully');

    const loginResponse = await page.request.post(
      ApiAddresses.apiBaseUrl + ApiAddresses.apiLogin,
      { data: { email: testUsers.userEmail, password: newValidPassword } }
    );
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody.accessToken ?? loginBody.token).toBeDefined();

    await changePasswordPage.goto();
    await expect(page).toHaveURL(/change-password/);
    const restoreResponsePromise = apiFlow.waitForChangePasswordResponse();
    await changePasswordPage.fillAndSubmit(newValidPassword, testUsers.commonPassword, testUsers.commonPassword);
    await apiFlow.verifySuccessfulChange(restoreResponsePromise);
  });

  test('Frontend Validation - Mismatched confirmation password prevents submission', async ({ page }) => {
    await changePasswordPage.currentPasswordInput.fill(testUsers.commonPassword);
    await changePasswordPage.newPasswordInput.fill('ValidPass123!');
    await changePasswordPage.confirmPasswordInput.fill('DifferentPass456!');
    await changePasswordPage.newPasswordInput.click();

    await expect(changePasswordPage.messageArea.getByText("The passwords don't match")).toBeVisible();
    await expect(changePasswordPage.submitButton).toBeDisabled();
  });

  test('Frontend Validation - Weak new password shows complexity error', async ({ page }) => {
    await changePasswordPage.newPasswordInput.fill('weak');
    await changePasswordPage.currentPasswordInput.click();

    await expect(changePasswordPage.messageArea.getByText('The password needs to have at least 8 characters')).toBeVisible();
    await expect(changePasswordPage.submitButton).toBeDisabled();
  });

  test('Backend Validation - Incorrect current password is rejected', async ({ page }) => {
    const apiFlow = new ApiFlow(page);

    const responsePromise = apiFlow.waitForChangePasswordResponse();
    await changePasswordPage.fillAndSubmit('WrongPassword999!', 'NewValidPass123!', 'NewValidPass123!');
    await apiFlow.verifyRejectedChange(responsePromise, [400]);
    await expect(changePasswordPage.errorToast).toBeVisible();
  });

});

