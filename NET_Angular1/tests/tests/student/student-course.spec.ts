import { test, expect } from '@playwright/test';
import { CoursesPage, CourseDetailsPage, CourseCreatePage, AddLessonPage } from '../../pages';
import { ApiFlow } from '../../api/api-flow';
import { createCourseFixture } from '../../fixtures/course.fixture';
import { createUnitFixture } from '../../fixtures/unit.fixture';
import { createLessonFixture } from '../../fixtures/lesson.fixture';
import { ApiAddresses } from '../../api/api-addresses';
import * as path from 'path';

test.use({ storageState: path.resolve(__dirname, '../../.auth/student.json') });

test.describe('Student Course and Progress Tracking Tests', () => {
  let coursesPage: CoursesPage;
  let courseDetailsPage: CourseDetailsPage;

  let createdCourseId: number | undefined;
  let createdCourseTitle: string;

  test.beforeAll(async ({ browser }) => {
    const teacherStorageState = path.resolve(__dirname, '../../.auth/teacher.json');
    const teacherContext = await browser.newContext({ storageState: teacherStorageState });
    const teacherPage = await teacherContext.newPage();

    const courseCreatePage = new CourseCreatePage(teacherPage);
    const detailsPage = new CourseDetailsPage(teacherPage);
    const addLessonPage = new AddLessonPage(teacherPage);
    const teacherApiFlow = new ApiFlow(teacherPage);

    const courseData = createCourseFixture();
    const unitData = createUnitFixture();
    const lessonData = createLessonFixture();
    createdCourseTitle = courseData.title;

    // 1. Create course via UI
    await courseCreatePage.goto();
    const createCourseResponsePromise = teacherApiFlow.waitForCreateCourseResponse();
    await courseCreatePage.createCourse(courseData);
    createdCourseId = await teacherApiFlow.verifySuccessfulCourseCreation(createCourseResponsePromise);

    // 2. Click the newly created course from course list
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));
    const coursesListPage = new CoursesPage(teacherPage);
    await coursesListPage.clickCourseByTitle(createdCourseTitle);
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));

    // 3. Add a unit inline
    await detailsPage.addUnitInline(unitData.title);
    const unitHeader = detailsPage.getUnitHeaderByTitle(unitData.title);
    await expect(unitHeader).toBeVisible();

    // 4. Expand unit & navigate to Add Lesson page
    await unitHeader.click();
    await expect(detailsPage.addLessonButton).toBeVisible();
    await detailsPage.addLessonButton.click();
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.units}/\\d+/lessons/new$`));

    // 5. Fill and save lesson using fixture data
    await addLessonPage.fillAndSave(lessonData);

    // 6. Redirected to course detail page, publish the course
    await expect(teacherPage).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));
    await detailsPage.publishCourse();

    await teacherPage.evaluate(() => localStorage.clear());
    await teacherContext.clearCookies();
    await teacherContext.close();
  });

  test.afterAll(async ({ browser }) => {
    if (createdCourseId !== undefined) {
      const teacherStorageState = path.resolve(__dirname, '../../.auth/teacher.json');
      const teacherContext = await browser.newContext({ storageState: teacherStorageState });
      const teacherPage = await teacherContext.newPage();
      const teacherApiFlow = new ApiFlow(teacherPage);

      await teacherApiFlow.deleteCourse(createdCourseId);
      await teacherPage.evaluate(() => localStorage.clear());
      await teacherContext.clearCookies();
      await teacherContext.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    coursesPage = new CoursesPage(page);
    courseDetailsPage = new CourseDetailsPage(page);
  });

  test('Verify if student can view available and enrolled courses in the courses module', async ({ page }) => {
    await coursesPage.goto();
    
    await expect(coursesPage.courseCards.first()).toBeVisible();
    
    const count = await coursesPage.courseCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Verify if student cannot view editing, adding, or deleting buttons on course details page', async ({ page }) => {
    await coursesPage.goto();
    await coursesPage.clickFirstCourse();
    
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));

    await expect(courseDetailsPage.addUnitButton).toBeHidden();
    
    await expect(courseDetailsPage.editButtons).toHaveCount(0);
    await expect(courseDetailsPage.deleteButtons).toHaveCount(0);
  });

  test('Verify if marking a lesson as completed updates course progress', async ({ page }) => {
    await coursesPage.goto();
    
    // Click on the teacher-created course card
    await coursesPage.clickCourseByTitle(createdCourseTitle);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+`));

    // Press enroll now, wait till the button disappears and the progress bar appears
    await expect(courseDetailsPage.enrollButton).toBeVisible();
    await courseDetailsPage.enrollButton.click();
    await expect(courseDetailsPage.enrollButton).toBeHidden({ timeout: 5000 });
    await expect(courseDetailsPage.progressText).toBeVisible({ timeout: 5000 });

    const apiFlow = new ApiFlow(page);

    // Open unit and press mark as complete
    await expect(courseDetailsPage.unitHeaders.first()).toBeVisible({ timeout: 5000 });
    await courseDetailsPage.unitHeaders.first().click();

    const markCompleteBtn = await courseDetailsPage.getUncompletedLessonMarkCompleteButton();
    await expect(markCompleteBtn).toBeVisible({ timeout: 10000 });

    const initialProgress = await courseDetailsPage.getProgressText();

    const responsePromise = apiFlow.waitForCompleteLessonResponse();
    await markCompleteBtn.click();
    await apiFlow.verifySuccessfulLessonCompletion(responsePromise);

    await expect(courseDetailsPage.progressText).not.toHaveText(initialProgress, { timeout: 10000 });
  });
});
