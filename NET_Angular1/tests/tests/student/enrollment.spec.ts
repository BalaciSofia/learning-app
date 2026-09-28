import { test, expect } from '@playwright/test';
import * as path from 'path';
import { CoursesPage, CourseDetailsPage, CourseCreatePage, AddLessonPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import { createCourseFixture } from '../../fixtures/course.fixture';
import { createUnitFixture } from '../../fixtures/unit.fixture';
import { createLessonFixture } from '../../fixtures/lesson.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({ storageState: path.resolve(__dirname, '../../.auth/student.json') });

test.describe('Enrollment - UI Flow Tests', () => {
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
    const apiFlow = new ApiFlow(teacherPage);

    const courseData = createCourseFixture();
    const unitData = createUnitFixture();
    const lessonData = createLessonFixture();
    createdCourseTitle = courseData.title;

    await courseCreatePage.goto();
    const createResponsePromise = apiFlow.waitForCreateCourseResponse();
    await courseCreatePage.createCourse(courseData);
    createdCourseId = await apiFlow.verifySuccessfulCourseCreation(createResponsePromise);

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

    // Prevent teacher origin state from leaking into subsequent student contexts
    await teacherPage.evaluate(() => localStorage.clear());
    await teacherContext.clearCookies();
    await teacherContext.close();
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


  test('Verify that a published course appears in the Available Courses section for an unenrolled student', async ({ page }) => {
    const coursesPage = new CoursesPage(page);
    await coursesPage.goto();

    await expect(
      coursesPage.getCourseCardInSection(coursesPage.availableCoursesSection, createdCourseTitle)
    ).toBeVisible();
  });

  test('Verify that the enrollment banner is shown when a student opens a course they are not enrolled in', async ({ page }) => {
    const coursesPage = new CoursesPage(page);
    const detailsPage = new CourseDetailsPage(page);

    await coursesPage.goto();
    await coursesPage.clickCourseByTitle(createdCourseTitle);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));

    await expect(detailsPage.enrollmentBanner).toBeVisible();
    await expect(detailsPage.enrollButton).toBeVisible();
  });


  test('Verify that clicking Enroll Now enrolls the student and replaces the banner with a progress section', async ({ page }) => {
    const coursesPage = new CoursesPage(page);
    const detailsPage = new CourseDetailsPage(page);
    const apiFlow = new ApiFlow(page);

    await coursesPage.goto();
    await coursesPage.clickCourseByTitle(createdCourseTitle);
    await expect(detailsPage.enrollButton).toBeVisible();

    const enrollResponsePromise = apiFlow.waitForEnrollResponse(createdCourseId!);
    await detailsPage.enrollButton.click();
    await apiFlow.verifySuccessfulEnrollment(enrollResponsePromise);

    await expect(detailsPage.enrollmentBanner).toBeHidden();
    await expect(detailsPage.progressSection).toBeVisible();
  });


  test.describe('Post-enrollment state', () => {
    test.beforeEach(async ({ page }) => {
      const detailsPage = new CourseDetailsPage(page);
      const apiFlow = new ApiFlow(page);

      const progressResponsePromise = apiFlow.waitForProgressResponse(createdCourseId!);
      await detailsPage.goto(createdCourseId!);
      const progressStatus = (await progressResponsePromise).status();

      if (progressStatus === 403) {
        const enrollResponsePromise = apiFlow.waitForEnrollResponse(createdCourseId!);
        await expect(detailsPage.enrollButton).toBeVisible();
        await detailsPage.enrollButton.click();
        await apiFlow.verifySuccessfulEnrollment(enrollResponsePromise);
      }
      await expect(detailsPage.progressSection).toBeVisible();
    });

    test('Verify that after enrollment the course appears in the Enrolled Courses section', async ({ page }) => {
      const coursesPage = new CoursesPage(page);
      await coursesPage.goto();

      await expect(
        coursesPage.getCourseCardInSection(coursesPage.enrolledCoursesSection, createdCourseTitle)
      ).toBeVisible();
    });

    test('Verify that after enrollment the course no longer appears in the Available Courses section', async ({ page }) => {
      const coursesPage = new CoursesPage(page);
      await coursesPage.goto();

      await expect(
        coursesPage.getCourseCardInSection(coursesPage.availableCoursesSection, createdCourseTitle)
      ).toBeHidden();
    });

    test('Verify that the Enroll Now button is not shown when loading an already enrolled course', async ({ page }) => {
      const detailsPage = new CourseDetailsPage(page);
      const apiFlow = new ApiFlow(page);

      const progressResponsePromise = apiFlow.waitForProgressResponse(createdCourseId!);
      await page.reload();
      expect((await progressResponsePromise).status()).toBe(200);

      await expect(detailsPage.progressSection).toBeVisible();
      await expect(detailsPage.enrollButton).toBeHidden();
      await expect(detailsPage.progressText).toBeVisible();
    });

    test('Verify that initial progress shows 0 of 1 lessons completed after enrollment', async ({ page }) => {
      const detailsPage = new CourseDetailsPage(page);
      const apiFlow = new ApiFlow(page);

      const progressResponsePromise = apiFlow.waitForProgressResponse(createdCourseId!);
      await page.reload();
      expect((await progressResponsePromise).status()).toBe(200);

      await expect(detailsPage.progressText).toBeVisible();
      const progressText = await detailsPage.getProgressText();
      expect(progressText).toMatch(/0\s+of\s+1/);
    });
  });
});
