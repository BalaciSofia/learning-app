import { expect, test } from '../../fixtures/forgot-password.fixture';
import { ApiAddresses } from '../../api/api-addresses';
import { ApiFlow } from '../../api/api-flow';
import { ForgotPasswordPage } from '../../pages';
import * as path from 'path';

test.use({storageState: path.resolve(__dirname,'../../.auth/not-login-state.json')});

test.describe('Forgot Password Tests', () => {
  let forgotPasswordPage: ForgotPasswordPage;
  let apiFlow: ApiFlow;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    apiFlow = new ApiFlow(page);
    await forgotPasswordPage.goto();
  });

  test('Verify if a registered user can request a password reset', async ({ forgotPasswordData }) => {
    const responsePromise = apiFlow.waitForForgotPasswordResponse();

    await forgotPasswordPage.requestPasswordReset(forgotPasswordData.registeredEmail);
    await apiFlow.verifySuccessfulForgotPassword(
      responsePromise,
      forgotPasswordData.registeredEmail,
      forgotPasswordData.successMessage
    );

    await expect(forgotPasswordPage.successHeading).toBeVisible();
  });

  test('Verify if an unregistered email receives the generic response', async ({ forgotPasswordData }) => {
    const responsePromise = apiFlow.waitForForgotPasswordResponse();

    await forgotPasswordPage.requestPasswordReset(forgotPasswordData.unregisteredEmail);
    await apiFlow.verifySuccessfulForgotPassword(
      responsePromise,
      forgotPasswordData.unregisteredEmail,
      forgotPasswordData.successMessage
    );

    await expect(forgotPasswordPage.successHeading).toBeVisible();
  });

  test('Verify if an invalid email shows a validation error', async ({ forgotPasswordData }) => {
    await forgotPasswordPage.requestPasswordReset(forgotPasswordData.invalidEmail);
    await expect(forgotPasswordPage.invalidEmailError).toBeVisible();
  });

  test('Verify if an empty email shows the required validation error', async () => {
    await forgotPasswordPage.submitEmptyForm();
    await expect(forgotPasswordPage.requiredEmailError).toBeVisible();
  });

  test('Verify if the submit button is disabled while the request is pending', async ({
    page,
    forgotPasswordData
  }) => {
    let releaseResponse: () => void = () => undefined;

    const responseGate = new Promise<void>(resolve => {
      releaseResponse = resolve;
    });

    await page.route(`**${ApiAddresses.apiForgotPassword}`, async route => {
      await responseGate;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: forgotPasswordData.successMessage })
      });
    });

    const responsePromise = apiFlow.waitForForgotPasswordResponse();

    await forgotPasswordPage.requestPasswordReset(forgotPasswordData.processingEmail);
    await expect(forgotPasswordPage.submitButton).toBeDisabled();

    releaseResponse();
    await responsePromise;
  });

  test('Verify if the form is submitted when Enter is pressed', async ({ forgotPasswordData }) => {
    const responsePromise = apiFlow.waitForForgotPasswordResponse();

    await forgotPasswordPage.submitWithEnter(forgotPasswordData.keyboardEmail);
    await apiFlow.verifySuccessfulForgotPassword(
      responsePromise,
      forgotPasswordData.keyboardEmail,
      forgotPasswordData.successMessage
    );

    await expect(forgotPasswordPage.successHeading).toBeVisible();
  });

  test('Verify if the user is redirected to login from the confirmation page', async ({
    page,
    forgotPasswordData
  }) => {
    const responsePromise = apiFlow.waitForForgotPasswordResponse();

    await forgotPasswordPage.requestPasswordReset(forgotPasswordData.navigationEmail);
    await responsePromise;
    await forgotPasswordPage.navigateBackToLogin();

    await expect(page).toHaveURL(/.*login/);
  });
});