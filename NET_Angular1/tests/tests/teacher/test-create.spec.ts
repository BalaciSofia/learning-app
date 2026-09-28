import { test, expect } from '@playwright/test';
import * as path from 'path';

import { ApiFlow } from '../../api/api-flow';
import { createTestFixture, INVALID_TEST_DATA } from '../../fixtures/test.fixture';
import { TestCreatePage } from '../../pages';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
});

test.describe('Test Creation Tests', () => {
  let testCreatePage: TestCreatePage;
  let apiFlow: ApiFlow;

  test.beforeEach(({ page }) => {
    testCreatePage = new TestCreatePage(page);
    apiFlow = new ApiFlow(page);
  });

  test('Verify if teacher can successfully create a test', async ({ page }) => {
    const testData = createTestFixture();
    let testId: number | undefined;

    try {
      await testCreatePage.goto();
      await expect(page).toHaveURL(/\/modules\/testing\/create$/);
      const responsePromise = apiFlow.waitForCreateTestResponse();
      await testCreatePage.createTest(testData);
      testId = await apiFlow.verifySuccessfulTestCreation(responsePromise);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/questions$`));
    } finally {
      if (testId !== undefined) {
        await apiFlow.deleteTest(testId);
      }
    }
  });
});

test.describe('Test Creation Validation', () => {
  let testCreatePage: TestCreatePage;

  test.beforeEach(async ({ page }) => {
    testCreatePage = new TestCreatePage(page);
    await testCreatePage.goto();
  });

  test('Verify that an error is shown when the title is left empty', async () => {
    await testCreatePage.fillTitle('');

    await expect(testCreatePage.fieldError('title')).toBeVisible();
  });

  test('Verify that the save button is disabled while the title is empty', async () => {
    await testCreatePage.fillTitle('');

    await expect(testCreatePage.getSaveButton()).toBeDisabled();
  });

  test('Verify that an error is shown when the title exceeds the maximum length', async () => {
    await testCreatePage.fillTitle(INVALID_TEST_DATA.titleTooLong);

    await expect(testCreatePage.fieldError('title')).toBeVisible();
  });

  test('Verify that an error is shown when the description exceeds the maximum length', async () => {
    await testCreatePage.fillDescription(INVALID_TEST_DATA.descriptionTooLong);

    await expect(testCreatePage.fieldError('description')).toBeVisible();
  });
});