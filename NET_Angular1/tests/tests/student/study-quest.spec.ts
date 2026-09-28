import { test, expect } from '@playwright/test';
import * as path from 'path';
import { CoursesPage, CourseCreatePage, CourseDetailsPage, AddLessonPage, StudyQuestPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import { createCourseFixture } from '../../fixtures/course.fixture';
import { createUnitFixture } from '../../fixtures/unit.fixture';
import { createLessonFixture } from '../../fixtures/lesson.fixture';
import { MOCK_DAILY_PUZZLE, MOCK_CORRECT_ANSWER, MOCK_INCORRECT_ANSWER, MOCK_ALREADY_CLAIMED_ANSWER,} from '../../fixtures/study-quest.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({ storageState: path.resolve(__dirname, '../../.auth/student.json') });

test.describe('Study Quest - Player Profile and Daily Activity', () => {
  let createdCourseId: number | undefined;
  let createdCourseTitle: string;

  test.beforeAll(async ({ browser }) => {
    const teacherContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
    });
    const teacherPage = await teacherContext.newPage();

    const courseCreatePage = new CourseCreatePage(teacherPage);
    const detailsPage = new CourseDetailsPage(teacherPage);
    const addLessonPage = new AddLessonPage(teacherPage);
    const teacherApiFlow = new ApiFlow(teacherPage);

    const courseData = createCourseFixture();
    const unitData = createUnitFixture();
    const lessonData = createLessonFixture();
    createdCourseTitle = courseData.title;

    await courseCreatePage.goto();
    const createResponsePromise = teacherApiFlow.waitForCreateCourseResponse();
    await courseCreatePage.createCourse(courseData);
    createdCourseId = await teacherApiFlow.verifySuccessfulCourseCreation(createResponsePromise);

    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));
    const coursesListPage = new CoursesPage(teacherPage);
    await coursesListPage.clickCourseByTitle(createdCourseTitle);
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));

    await detailsPage.addUnitInline(unitData.title);
    const unitHeader = detailsPage.getUnitHeaderByTitle(unitData.title);
    await unitHeader.click();
    await expect(detailsPage.addLessonButton).toBeVisible();
    await detailsPage.addLessonButton.click();
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.units}/\\d+/lessons/new$`));

    await addLessonPage.fillAndSave(lessonData);
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));
    await detailsPage.publishCourse();

    await teacherPage.evaluate(() => localStorage.clear());
    await teacherContext.clearCookies();
    await teacherContext.close();

    const studentContext = await browser.newContext({
      storageState: path.resolve(__dirname, '../../.auth/student.json'),
    });
    const studentPage = await studentContext.newPage();
    await new ApiFlow(studentPage).apiEnrollInCourse(createdCourseId!);
    await studentPage.evaluate(() => localStorage.clear());
    await studentContext.clearCookies();
    await studentContext.close();
  });

  test.afterAll(async ({ browser }) => {
    if (createdCourseId !== undefined) {
      const teacherContext = await browser.newContext({
        storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
      });
      const teacherPage = await teacherContext.newPage();
      await new ApiFlow(teacherPage).deleteCourse(createdCourseId);
      await teacherPage.evaluate(() => localStorage.clear());
      await teacherContext.clearCookies();
      await teacherContext.close();
    }
  });

  test('Verify student can navigate to Study Quest from an enrolled course card', async ({ page }) => {
    const coursesPage = new CoursesPage(page);
    await coursesPage.goto();

    const courseCard = coursesPage.getCourseCardInSection(
      coursesPage.enrolledCoursesSection,
      createdCourseTitle,
    );
    const studyQuestLink = courseCard.locator('.action-link', { hasText: 'Study Quest' });
    await expect(studyQuestLink).toBeVisible();

    await studyQuestLink.click();
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.studyQuest}\\?courseId=\\d+`));
  });

  test('Verify Study Quest profile page displays player name, XP, level, and rank badges', async ({ page }) => {
    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.profileName).toBeVisible();
    await expect(studyQuestPage.levelPill).toBeVisible();
    await expect(studyQuestPage.rankPill).toBeVisible();
    await expect(studyQuestPage.xpPill).toBeVisible();

    await expect(studyQuestPage.levelPill).toContainText('Level');
    await expect(studyQuestPage.xpPill).toContainText('XP');
  });

  test("Verify Today's Activity section shows the student's current streak value", async ({ page }) => {
    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.statsSection).toBeVisible();
    await expect(studyQuestPage.streakValue).toBeVisible();
  });

  test('Verify medals section is not visible when a student has not earned any medals', async ({ page }) => {
    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.profileName).toBeVisible();
    await expect(studyQuestPage.medalsSection).not.toBeVisible();
  });

  test('Verify Conquest button is visible on the Study Quest page', async ({ page }) => {
    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.conquestButton).toBeVisible();
    await expect(studyQuestPage.conquestButton).toContainText('Conquest');
  });

  test('Verify Study Quest shows an error message when the course ID is invalid', async ({ page }) => {
    await page.goto(`${ApiAddresses.baseUrl}${ApiAddresses.studyQuest}?courseId=0`);

    const studyQuestPage = new StudyQuestPage(page);
    await expect(studyQuestPage.errorState).toBeVisible();
    await expect(studyQuestPage.errorState).toContainText('Invalid course');
  });


  test('Verify daily puzzle section displays question text and selectable answer options', async ({ page }) => {
    await page.route(`**/api/studyquest/daily-puzzle**`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DAILY_PUZZLE),
      }),
    );

    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.puzzleSection).toBeVisible();
    await expect(studyQuestPage.puzzleQuestion).toContainText(MOCK_DAILY_PUZZLE.questionText);

    await expect(studyQuestPage.puzzleOptions).toHaveCount(MOCK_DAILY_PUZZLE.options.length);
    for (const optionText of MOCK_DAILY_PUZZLE.options) {
      await expect(studyQuestPage.puzzleOptions.filter({ hasText: optionText })).toBeVisible();
    }
  });

  test('Verify selecting the correct answer shows a success message with XP awarded', async ({ page }) => {
    await page.route(`**/api/studyquest/daily-puzzle**`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DAILY_PUZZLE),
      }),
    );
    await page.route(`**/api/studyquest/answer-daily-puzzle`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CORRECT_ANSWER),
      }),
    );

    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.puzzleOptions.first()).toBeVisible();
    await studyQuestPage.puzzleOptions.first().click();

    await expect(studyQuestPage.puzzleResult).toBeVisible();
    await expect(studyQuestPage.puzzleResult).toContainText(
      `+${MOCK_CORRECT_ANSWER.xpAwarded} XP`,
    );
    await expect(studyQuestPage.puzzleResult).toContainText('Correct!');
    await expect(studyQuestPage.puzzleResult).toHaveClass(/correct/);
  });

  test('Verify selecting an incorrect answer shows a wrong answer message', async ({ page }) => {
    await page.route(`**/api/studyquest/daily-puzzle**`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DAILY_PUZZLE),
      }),
    );
    await page.route(`**/api/studyquest/answer-daily-puzzle`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_INCORRECT_ANSWER),
      }),
    );

    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.puzzleOptions.first()).toBeVisible();
    await studyQuestPage.puzzleOptions.first().click();

    await expect(studyQuestPage.puzzleResult).toBeVisible();
    await expect(studyQuestPage.puzzleResult).toContainText('Wrong answer');
    await expect(studyQuestPage.puzzleResult).toHaveClass(/incorrect/);
  });

  test('Verify daily puzzle shows already answered today message when puzzle was already claimed', async ({ page }) => {
    const claimedPuzzle = { ...MOCK_DAILY_PUZZLE, alreadyClaimed: true };
    await page.route(`**/api/studyquest/daily-puzzle**`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(claimedPuzzle),
      }),
    );

    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.puzzleSection).toBeVisible();
    await expect(studyQuestPage.puzzleResult).toBeVisible();
    await expect(studyQuestPage.puzzleResult).toContainText('Already answered today');
    await expect(studyQuestPage.puzzleOptions).toHaveCount(0);
  });

  test('Verify answering the puzzle a second time shows already answered message', async ({ page }) => {
    await page.route(`**/api/studyquest/daily-puzzle**`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DAILY_PUZZLE),
      }),
    );
    await page.route(`**/api/studyquest/answer-daily-puzzle`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ALREADY_CLAIMED_ANSWER),
      }),
    );

    const studyQuestPage = new StudyQuestPage(page);
    await studyQuestPage.goto(createdCourseId!);

    await expect(studyQuestPage.puzzleOptions.first()).toBeVisible();
    await studyQuestPage.puzzleOptions.first().click();

    await expect(studyQuestPage.puzzleResult).toBeVisible();
    await expect(studyQuestPage.puzzleResult).toContainText('Already answered today');
  });
});
