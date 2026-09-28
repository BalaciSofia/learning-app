import { test, expect } from '@playwright/test';
import * as path from 'path';
import { TestCreatePage, QuestionBuilderPage, TestDetailPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import { createTestFixture } from '../../fixtures/test.fixture';
import { createSingleChoiceQuestionFixture, createMultipleChoiceQuestionFixture, ATTEMPTED_EDIT_TEXT,} from '../../fixtures/question.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({ storageState: path.resolve(__dirname, '../../.auth/teacher.json') });

const questionBuilderUrlPattern = new RegExp(`${ApiAddresses.testing}/\\d+/questions`);

test.describe('Teacher - Question and Answer CRUD', () => {
  let testCreatePage: TestCreatePage;
  let questionBuilderPage: QuestionBuilderPage;
  let testDetailPage: TestDetailPage;
  let apiFlow: ApiFlow;
  let testId: number;

  test.beforeEach(async ({ page }) => {
    testCreatePage = new TestCreatePage(page);
    questionBuilderPage = new QuestionBuilderPage(page);
    testDetailPage = new TestDetailPage(page);
    apiFlow = new ApiFlow(page);

    await testCreatePage.goto();
    await testCreatePage.createTest(createTestFixture());
    await page.waitForURL(questionBuilderUrlPattern);

    testId = Number(page.url().match(questionBuilderUrlPattern)?.[0].match(/\d+/)?.[0]);
  });

  test.afterEach(async () => {
    await apiFlow.deleteTest(testId);
  });

  test('Verify if a teacher can add a single-choice question with manual answers', async () => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    const response = await questionBuilderPage.submitQuestion();

    expect(response.status()).toBe(201);

    await questionBuilderPage.finish();

    expect(await testDetailPage.isQuestionVisible(question.text)).toBe(true);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[0].text)).toBe(true);
  });

  test('Verify if a teacher can add a multiple-choice question with manual answers', async () => {
    const question = createMultipleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('multiple');
    await questionBuilderPage.fillManualAnswers(question.answers);
    const response = await questionBuilderPage.submitQuestion();

    expect(response.status()).toBe(201);

    await questionBuilderPage.finish();

    expect(await testDetailPage.isQuestionVisible(question.text)).toBe(true);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[0].text)).toBe(true);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[1].text)).toBe(true);
  });

  test('Verify if saving a single-choice question with more than one correct answer is disabled', async () => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers([
      { text: question.answers[0].text, isCorrect: true },
      { text: question.answers[1].text, isCorrect: true },
    ]);

    await expect(questionBuilderPage.getSaveButton()).toBeDisabled();
  });

  test('Verify if a teacher can edit an existing question\'s text', async () => {
    const question = createSingleChoiceQuestionFixture();
    const updatedText = createSingleChoiceQuestionFixture().text;

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    const response = await testDetailPage.editQuestionText(question.text, updatedText);

    expect(response.status()).toBe(200);
    expect(await testDetailPage.isQuestionVisible(updatedText)).toBe(true);
    expect(await testDetailPage.isQuestionVisible(question.text)).toBe(false);
  });

  test('Verify if a teacher can delete a question', async () => {
    const question = createSingleChoiceQuestionFixture();
    const secondQuestion = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();

    await questionBuilderPage.fillQuestionText(secondQuestion.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(secondQuestion.answers);
    await questionBuilderPage.submitQuestion();

    await questionBuilderPage.finish();

    const response = await testDetailPage.deleteQuestion(question.text);

    expect(response.status()).toBe(204);
    expect(await testDetailPage.isQuestionVisible(question.text)).toBe(false);
    expect(await testDetailPage.isQuestionVisible(secondQuestion.text)).toBe(true);
  });

  test('Verify if a teacher can edit an existing answer\'s text', async () => {
    const question = createSingleChoiceQuestionFixture();
    const updatedAnswerText = createSingleChoiceQuestionFixture().answers[0].text;

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    const response = await testDetailPage.editAnswerText(question.text, question.answers[0].text, updatedAnswerText);

    expect(response.status()).toBe(200);
    expect(await testDetailPage.isAnswerVisible(question.text, updatedAnswerText)).toBe(true);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[0].text)).toBe(false);
  });

  test('Verify if a teacher can delete an answer', async () => {
    const question = createMultipleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('multiple');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    const response = await testDetailPage.deleteAnswer(question.text, question.answers[2].text);

    expect(response.status()).toBe(204);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[2].text)).toBe(false);
  });

  test('Verify if editing a question in a published test is rejected', async ({ page }) => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    const publishResponse = await testDetailPage.publishTest();
    expect(publishResponse.status()).toBe(200);

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const questionsListResponse = await page.request.get(
      `${ApiAddresses.apiBaseUrl}${ApiAddresses.apiTests}/${testId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { questions } = await questionsListResponse.json();
    const questionId = questions[0].id;

    const updateResponse = await page.request.put(
      `${ApiAddresses.apiBaseUrl}${ApiAddresses.apiTests}/${testId}/questions/${questionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { text: ATTEMPTED_EDIT_TEXT, type: question.type },
      }
    );

    expect(updateResponse.status()).toBe(409);
  });

  test('Verify if deleting an answer is rejected when only the minimum number of answers remain', async () => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    const response = await testDetailPage.deleteAnswer(question.text, question.answers[0].text);

    expect(response.status()).toBe(500);
    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[0].text)).toBe(true);
  });

  test('Verify if saving a multiple-choice question with no correct answers is disabled', async () => {
    const question = createMultipleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('multiple');
    await questionBuilderPage.fillManualAnswers(
      question.answers.map(answer => ({ ...answer, isCorrect: false }))
    );

    await expect(questionBuilderPage.getSaveButton()).toBeDisabled();
  });

  test('Verify if Remove is disabled when only 2 answers remain', async () => {
    await expect(questionBuilderPage.getRemoveButtonForRow(0)).toBeDisabled();
    await expect(questionBuilderPage.getRemoveButtonForRow(1)).toBeDisabled();
  });

  test('Verify if Add answer is disabled after reaching the maximum of 6 answers', async () => {
    for (let i = 0; i < 4; i++) {
      await questionBuilderPage.addAnswerRow();
    }

    await expect(questionBuilderPage.getAnswerRowsLocator()).toHaveCount(6);
    await expect(questionBuilderPage.getAddAnswerButton()).toBeDisabled();
  });

  test('Verify if cancelling a question edit reverts the text unchanged', async () => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    await testDetailPage.cancelQuestionEdit(question.text, ATTEMPTED_EDIT_TEXT);

    expect(await testDetailPage.isQuestionVisible(question.text)).toBe(true);
  });

  test('Verify if cancelling an answer edit reverts the text unchanged', async () => {
    const question = createSingleChoiceQuestionFixture();

    await questionBuilderPage.fillQuestionText(question.text);
    await questionBuilderPage.selectType('single');
    await questionBuilderPage.fillManualAnswers(question.answers);
    await questionBuilderPage.submitQuestion();
    await questionBuilderPage.finish();

    await testDetailPage.cancelAnswerEdit(question.text, question.answers[0].text, ATTEMPTED_EDIT_TEXT);

    expect(await testDetailPage.isAnswerVisible(question.text, question.answers[0].text)).toBe(true);
  });
});
