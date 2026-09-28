import { test, expect } from '@playwright/test';
import * as path from 'path';
import { TestCreatePage, QuestionBuilderPage } from '../../pages';
import { createTestFixture } from '../../fixtures/test.fixture';
import { randomUUID } from 'crypto';
import { ApiAddresses } from '../../api/api-addresses';
import { ApiFlow } from '../../api/api-flow';

test.use({ storageState: path.resolve(__dirname, '../../.auth/teacher.json') });

const questionBuilderUrlPattern = new RegExp(`${ApiAddresses.testing}/\\d+/questions`);

test.describe('Teacher - AI Generated Answers', () => {
  let questionBuilderPage: QuestionBuilderPage;
  let testId : number;
  let apiFlow: ApiFlow;

  test.beforeEach(async ({ page }) => {
    const testCreatePage = new TestCreatePage(page);
    questionBuilderPage = new QuestionBuilderPage(page);

    await testCreatePage.goto();
    await testCreatePage.createTest(createTestFixture());

    apiFlow = new ApiFlow(page);
    
    await page.waitForURL(questionBuilderUrlPattern);
    testId = Number(page.url().match(questionBuilderUrlPattern)?.[0].match(/\d+/)?.[0]);
    await questionBuilderPage.setAiMode();
  });
  test.afterEach(async () => {
    await apiFlow.deleteTest(testId);
  });

  test('Verify if generating distractors populates the answer list with the correct answer plus AI-generated options', async () => {
    const uniqueId = randomUUID().slice(0, 8);

    await questionBuilderPage.fillQuestionText(`What is the capital of France? (${uniqueId})`);
    await questionBuilderPage.fillCorrectAnswer('Paris');

    const response = await questionBuilderPage.generateDistractors();
    expect(response.status()).toBe(200);

    const answerCount = await questionBuilderPage.getAnswerRowCount();
    expect(answerCount).toBeGreaterThan(1);

    const firstAnswerText = await questionBuilderPage.getAnswerRowText(0);
    expect(firstAnswerText).toBe('Paris');
  });

  test('Verify if generating distractors without a correct answer filled in shows a validation error', async () => {
    const uniqueId = randomUUID().slice(0, 8);

    await questionBuilderPage.fillQuestionText(`Question with no correct answer ${uniqueId}?`);
    await questionBuilderPage.clickGenerateWithoutWaiting();

    await expect(questionBuilderPage.getCorrectAnswerFieldError()).toBeVisible();
    expect(await questionBuilderPage.getAnswerRowCount()).toBe(0);
  });

  test('Verify if switching to AI mode resets the question type to single-choice', async ({ page }) => {
    const singleChoiceRadio = page.getByRole('radio', { name: 'Single choice' });
    await expect(singleChoiceRadio).toBeChecked();
  });
});
