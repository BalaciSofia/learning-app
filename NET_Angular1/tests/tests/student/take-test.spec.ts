import { BrowserContext, expect, Page, test } from '@playwright/test';
import * as path from 'path';
import { createMultipleChoiceQuestionFixture, createSingleChoiceQuestionFixture } from '../../fixtures/question.fixture';
import { createTestFixture } from '../../fixtures/test.fixture';
import { QuestionBuilderPage, TakeTestPage, TestCreatePage, TestDetailPage, TestResultPage, TestsListPage, PreviousAttemptsPage,} from '../../pages';

const teacherStorageState = path.resolve(__dirname, '../../.auth/teacher.json');
const questionBuilderUrlPattern = /\/modules\/testing\/(\d+)\/questions$/;

test.use({
  storageState: path.resolve(__dirname, '../../.auth/student.json'),
});

test.describe('Student Taking Test Tests', () => {
  let teacherContext: BrowserContext;
  let teacherPage: Page;
  let testCreatePage: TestCreatePage;
  let questionBuilderPage: QuestionBuilderPage;
  let testDetailPage: TestDetailPage;
  let testsListPage: TestsListPage;
  let takeTestPage: TakeTestPage;
  let testResultPage: TestResultPage;
  let testId: number | undefined;
  let studentPreviousAttemptsPage: PreviousAttemptsPage;
  let teacherPreviousAttemptsPage: PreviousAttemptsPage;

  test.beforeEach(async ({ browser, page }) => {
    testId = undefined;

    teacherContext = await browser.newContext({
      storageState: teacherStorageState,
    });

    teacherPage = await teacherContext.newPage();

    testCreatePage = new TestCreatePage(teacherPage);
    questionBuilderPage = new QuestionBuilderPage(teacherPage);
    testDetailPage = new TestDetailPage(teacherPage);
    testsListPage = new TestsListPage(page);
    takeTestPage = new TakeTestPage(page);
    testResultPage = new TestResultPage(page);
    studentPreviousAttemptsPage = new PreviousAttemptsPage(page);
    teacherPreviousAttemptsPage = new PreviousAttemptsPage(teacherPage);
  });

  test.afterEach(async () => {
    try {
      if (testId !== undefined) {
        await testDetailPage.goto(testId);
        await testDetailPage.deleteTest();
      }
    } finally {
      await teacherContext.close();
    }
  });

  test(
    'Verify if student can successfully complete a test with single-choice and multiple-choice questions',
    async ({ page }) => {
      const testData = createTestFixture();
      const singleChoiceQuestion = createSingleChoiceQuestionFixture();
      const multipleChoiceQuestion = createMultipleChoiceQuestionFixture();
      const singleCorrectAnswer = singleChoiceQuestion.answers.find(answer => answer.isCorrect);
      const multipleCorrectAnswers = multipleChoiceQuestion.answers.filter(answer => answer.isCorrect);

      if (!singleCorrectAnswer) {
        throw new Error('The single-choice fixture does not contain a correct answer.');
      }

      if (multipleCorrectAnswers.length < 2) {
        throw new Error('The multiple-choice fixture must contain at least two correct answers.');
      }

      // Teacher creates the test
      await testCreatePage.goto();
      await testCreatePage.createTest(testData);
      await expect(teacherPage).toHaveURL(questionBuilderUrlPattern);

      const urlMatch = teacherPage.url().match(questionBuilderUrlPattern);

      if (!urlMatch) {
        throw new Error('Could not extract the created test ID from the URL.');
      }

      testId = Number(urlMatch[1]);

      // Teacher creates the single-choice question
      await questionBuilderPage.fillQuestionText(singleChoiceQuestion.text);
      await questionBuilderPage.selectType('single');
      await questionBuilderPage.fillManualAnswers(singleChoiceQuestion.answers);
      const singleQuestionResponse = await questionBuilderPage.submitQuestion();
      expect(singleQuestionResponse.status()).toBe(201);

      // Teacher creates the multiple-choice question
      await questionBuilderPage.fillQuestionText(multipleChoiceQuestion.text);
      await questionBuilderPage.selectType('multiple');
      await questionBuilderPage.fillManualAnswers(multipleChoiceQuestion.answers);
      const multipleQuestionResponse = await questionBuilderPage.submitQuestion();
      expect(multipleQuestionResponse.status()).toBe(201);

      // Teacher finishes adding questions and publishes the test
      await questionBuilderPage.finish();
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}$`));
      const publishResponse = await testDetailPage.publishTest();
      expect(publishResponse.status()).toBe(200);

      // Student opens the newly published test
      await testsListPage.goto();
      await testsListPage.openStudentTest(testData.title);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/take$`));
      await takeTestPage.waitUntilLoaded();
      await expect(takeTestPage.getQuestionProgress(1, 2)).toBeVisible();

      const singleChoiceIsFirst = await takeTestPage.getQuestion(singleChoiceQuestion.text).isVisible();

      if (singleChoiceIsFirst) {
        await takeTestPage.selectAnswer(singleCorrectAnswer.text);
        await takeTestPage.goToNextQuestion();
        await expect(takeTestPage.getQuestionProgress(2, 2)).toBeVisible();
        await expect(takeTestPage.getQuestion(multipleChoiceQuestion.text)).toBeVisible();

        for (const answer of multipleCorrectAnswers) {
          await takeTestPage.selectAnswer(answer.text);
        }
      } else {
        await expect(takeTestPage.getQuestion(multipleChoiceQuestion.text)).toBeVisible();

        for (const answer of multipleCorrectAnswers) {
          await takeTestPage.selectAnswer(answer.text);
        }

        await takeTestPage.goToNextQuestion();
        await expect(takeTestPage.getQuestionProgress(2, 2)).toBeVisible();
        await expect(takeTestPage.getQuestion(singleChoiceQuestion.text)).toBeVisible();
        await takeTestPage.selectAnswer(singleCorrectAnswer.text);
      }

      // Student submits the last question and finishes the test
      await takeTestPage.submitTest();
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts/\\d+/result$`));
      await testResultPage.waitUntilLoaded();
      await expect(testResultPage.getResultStatus()).toHaveText('Passed');
      await expect(testResultPage.getTotalScore()).toHaveText('2 / 2');
      await expect(testResultPage.getPercentage()).toHaveText('100%');
      await expect(testResultPage.getCorrectAnswers()).toHaveText('2 / 2');
    }
  );

  test(
    'Verify if student receives a failed result after submitting an incorrect answer',
    async ({ page }) => {
      const testData = createTestFixture();
      const singleChoiceQuestion = createSingleChoiceQuestionFixture();
      const incorrectAnswer = singleChoiceQuestion.answers.find(answer => !answer.isCorrect);

      if (!incorrectAnswer) {
        throw new Error('The single-choice fixture does not contain an incorrect answer.');
      }

      // Teacher creates the test
      await testCreatePage.goto();
      await testCreatePage.createTest(testData);
      await expect(teacherPage).toHaveURL(questionBuilderUrlPattern);

      const urlMatch = teacherPage.url().match(questionBuilderUrlPattern);

      if (!urlMatch) {
        throw new Error('Could not extract the created test ID from the URL.');
      }

      testId = Number(urlMatch[1]);

      // Teacher creates one single-choice question
      await questionBuilderPage.fillQuestionText(singleChoiceQuestion.text);
      await questionBuilderPage.selectType('single');
      await questionBuilderPage.fillManualAnswers(singleChoiceQuestion.answers);
      const questionResponse = await questionBuilderPage.submitQuestion();
      expect(questionResponse.status()).toBe(201);

      // Teacher finishes adding questions and publishes the test
      await questionBuilderPage.finish();
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}$`));
      const publishResponse = await testDetailPage.publishTest();
      expect(publishResponse.status()).toBe(200);

      // Student opens the test
      await testsListPage.goto();
      await testsListPage.openStudentTest(testData.title);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/take$`));
      await takeTestPage.waitUntilLoaded();
      await expect(takeTestPage.getQuestionProgress(1, 1)).toBeVisible();
      await expect(takeTestPage.getQuestion(singleChoiceQuestion.text)).toBeVisible();

      // Student selects the incorrect answer and submits the test
      await takeTestPage.selectAnswer(incorrectAnswer.text);
      await takeTestPage.submitTest();
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts/\\d+/result$`));
      await testResultPage.waitUntilLoaded();
      await expect(testResultPage.getResultStatus()).toHaveText('Failed');
      await expect(testResultPage.getTotalScore()).toHaveText('0 / 1');
      await expect(testResultPage.getPercentage()).toHaveText('0%');
      await expect(testResultPage.getCorrectAnswers()).toHaveText('0 / 1');
    }
  );

  test(
    'Verify if student cannot submit a test without selecting an answer',
    async ({ page }) => {
      const testData = createTestFixture();
      const singleChoiceQuestion = createSingleChoiceQuestionFixture();

      // Teacher creates the test
      await testCreatePage.goto();
      await testCreatePage.createTest(testData);
      await expect(teacherPage).toHaveURL(questionBuilderUrlPattern);

      const urlMatch = teacherPage.url().match(questionBuilderUrlPattern);

      if (!urlMatch) {
        throw new Error('Could not extract the created test ID from the URL.');
      }

      testId = Number(urlMatch[1]);

      // Teacher creates one single-choice question
      await questionBuilderPage.fillQuestionText(singleChoiceQuestion.text);
      await questionBuilderPage.selectType('single');
      await questionBuilderPage.fillManualAnswers(singleChoiceQuestion.answers);
      const questionResponse = await questionBuilderPage.submitQuestion();
      expect(questionResponse.status()).toBe(201);

      // Teacher finishes adding questions and publishes the test
      await questionBuilderPage.finish();
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}$`));
      const publishResponse = await testDetailPage.publishTest();
      expect(publishResponse.status()).toBe(200);

      // Student opens the test
      await testsListPage.goto();
      await testsListPage.openStudentTest(testData.title);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/take$`));
      await takeTestPage.waitUntilLoaded();
      await expect(takeTestPage.getQuestionProgress(1, 1)).toBeVisible();
      await expect(takeTestPage.getQuestion(singleChoiceQuestion.text)).toBeVisible();

      // Student tries to submit without selecting an answer
      await takeTestPage.submitTest();

      // Validation is displayed
      await expect(takeTestPage.getAnswerRequiredMessage()).toBeVisible();

      // Student remains on the test page
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/take$`));

      // The same question remains displayed
      await expect(takeTestPage.getQuestion(singleChoiceQuestion.text)).toBeVisible();
    }
  );

  test(
    'Verify if a submitted attempt is visible to both student and teacher',
    async ({ page }) => {
      const testData = createTestFixture();
      const singleChoiceQuestion = createSingleChoiceQuestionFixture();
      const correctAnswer = singleChoiceQuestion.answers.find(answer => answer.isCorrect);

      if (!correctAnswer) {
        throw new Error('The single-choice fixture does not contain a correct answer.');
      }

      // Teacher creates the test
      await testCreatePage.goto();
      await testCreatePage.createTest(testData);
      await expect(teacherPage).toHaveURL(questionBuilderUrlPattern);

      const testUrlMatch = teacherPage.url().match(questionBuilderUrlPattern);

      if (!testUrlMatch) {
        throw new Error('Could not extract the created test ID from the URL.');
      }

      testId = Number(testUrlMatch[1]);

      // Teacher creates one single-choice question
      await questionBuilderPage.fillQuestionText(singleChoiceQuestion.text);
      await questionBuilderPage.selectType('single');
      await questionBuilderPage.fillManualAnswers(singleChoiceQuestion.answers);
      const questionResponse = await questionBuilderPage.submitQuestion();
      expect(questionResponse.status()).toBe(201);

      // Teacher finishes adding questions and publishes the test
      await questionBuilderPage.finish();
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}$`));
      const publishResponse = await testDetailPage.publishTest();
      expect(publishResponse.status()).toBe(200);

      // Student opens and completes the test
      await testsListPage.goto();
      await testsListPage.openStudentTest(testData.title);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/take$`));
      await takeTestPage.waitUntilLoaded();
      await expect(takeTestPage.getQuestion(singleChoiceQuestion.text)).toBeVisible();
      await takeTestPage.selectAnswer(correctAnswer.text);
      await takeTestPage.submitTest();

      const attemptResultUrlPattern = /\/modules\/testing\/(\d+)\/attempts\/(\d+)\/result$/;

      await expect(page).toHaveURL(attemptResultUrlPattern);

      const attemptUrlMatch = page.url().match(attemptResultUrlPattern);

      if (!attemptUrlMatch) {
        throw new Error('Could not extract the submitted attempt ID from the URL.');
      }

      const attemptId = Number(attemptUrlMatch[2]);

      await testResultPage.waitUntilLoaded();
      await expect(testResultPage.getTotalScore()).toHaveText('1 / 1');

      // Student opens previous attempts
      await testResultPage.openPreviousAttempts();
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts$`));
      await studentPreviousAttemptsPage.waitUntilLoaded();
      await expect(studentPreviousAttemptsPage.getAttemptCard(1)).toBeVisible();
      await expect(studentPreviousAttemptsPage.getAttemptScore(1)).toHaveText('1 / 1');
      await expect(studentPreviousAttemptsPage.getAttemptPercentage(1)).toHaveText('100%');
      await studentPreviousAttemptsPage.openAttemptResult(1);
      await expect(page).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts/${attemptId}/result$`));

      // Teacher opens previous attempts for the same test
      await testDetailPage.goto(testId);
      await testDetailPage.openPreviousAttempts();
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts$`));
      await teacherPreviousAttemptsPage.waitUntilLoaded();
      await expect(teacherPreviousAttemptsPage.getAttemptCard(1)).toBeVisible();
      await expect(teacherPreviousAttemptsPage.getAttemptScore(1)).toHaveText('1 / 1');
      await expect(teacherPreviousAttemptsPage.getAttemptPercentage(1)).toHaveText('100%');
      await teacherPreviousAttemptsPage.openAttemptResult(1);
      await expect(teacherPage).toHaveURL(new RegExp(`/modules/testing/${testId}/attempts/${attemptId}/result$`));
    }
  );
});