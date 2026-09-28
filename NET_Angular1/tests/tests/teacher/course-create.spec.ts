import { test, expect } from '@playwright/test';
import * as path from 'path';

import { ApiFlow } from '../../api/api-flow';
import { createCourseFixture, INVALID_COURSE_DATA } from '../../fixtures/course.fixture';
import { CourseCreatePage, CourseListPage } from '../../pages';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
});

test.describe('Course Creation Tests', () => {
  let courseCreatePage: CourseCreatePage;
  let courseListPage: CourseListPage;
  let apiFlow: ApiFlow;

  test.beforeEach(({ page }) => {
    courseCreatePage = new CourseCreatePage(page);
    courseListPage = new CourseListPage(page);
    apiFlow = new ApiFlow(page);
  });

  test('Verify if teacher can successfully create a course', async ({ page }) => {
    const courseData = createCourseFixture();
    let courseId: number | undefined;

    try {
      await courseCreatePage.goto();
      await expect(page).toHaveURL(/\/courses\/create$/);
      const responsePromise = apiFlow.waitForCreateCourseResponse();
      await courseCreatePage.createCourse(courseData);
      courseId = await apiFlow.verifySuccessfulCourseCreation(responsePromise);
      await expect(page).toHaveURL(/\/courses$/);
      await expect(courseListPage.getCourseTitle(courseData.title)).toBeVisible();
    } finally {
      if (courseId !== undefined) {
        await apiFlow.deleteCourse(courseId);
      }
    }
  });
});

test.describe('Course Creation Validation', () => {
  let courseCreatePage: CourseCreatePage;

  test.beforeEach(async ({ page }) => {
    courseCreatePage = new CourseCreatePage(page);
    await courseCreatePage.goto();
  });

  test('Verify that required field errors are shown when the form is submitted empty', async ({ page }) => {
    await courseCreatePage.submit();

    await expect(courseCreatePage.fieldError('title')).toBeVisible();
    await expect(courseCreatePage.fieldError('description')).toBeVisible();
    await expect(courseCreatePage.fieldError('subject')).toBeVisible();
    await expect(courseCreatePage.fieldError('metadata')).toBeVisible();
    await expect(page).toHaveURL(/\/courses\/create$/);
  });

  test('Verify that an error is shown when the title exceeds the maximum length', async () => {
    await courseCreatePage.fillTitle(INVALID_COURSE_DATA.titleTooLong);

    await expect(courseCreatePage.fieldError('title')).toBeVisible();
  });

  test('Verify that an error is shown when the description exceeds the maximum length', async () => {
    await courseCreatePage.fillDescription(INVALID_COURSE_DATA.descriptionTooLong);

    await expect(courseCreatePage.fieldError('description')).toBeVisible();
  });

  test('Verify that an error is shown when the subject exceeds the maximum length', async () => {
    await courseCreatePage.fillSubject(INVALID_COURSE_DATA.subjectTooLong);

    await expect(courseCreatePage.fieldError('subject')).toBeVisible();
  });

  test('Verify that an error is shown when the metadata exceeds the maximum length', async () => {
    await courseCreatePage.fillMetadata(INVALID_COURSE_DATA.metadataTooLong);

    await expect(courseCreatePage.fieldError('metadata')).toBeVisible();
  });
});