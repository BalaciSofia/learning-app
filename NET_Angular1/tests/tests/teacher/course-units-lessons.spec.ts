import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

import { ApiFlow } from '../../api/api-flow';
import { ApiAddresses } from '../../api/api-addresses';
import { createCourseFixture } from '../../fixtures/course.fixture';
import { createUnitFixture, UNIT_TITLE_REQUIRED_ERROR } from '../../fixtures/unit.fixture';
import { createLessonFixture } from '../../fixtures/lesson.fixture';
import { CourseCreatePage, CoursesPage, CourseDetailsPage, AddLessonPage } from '../../pages';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
});

async function createCourse(
  page: Page,
  courseCreatePage: CourseCreatePage,
  coursesPage: CoursesPage,
  apiFlow: ApiFlow
): Promise<number> {
  const courseData = createCourseFixture();

  await courseCreatePage.goto();
  const responsePromise = apiFlow.waitForCreateCourseResponse();
  await courseCreatePage.createCourse(courseData);
  const courseId = await apiFlow.verifySuccessfulCourseCreation(responsePromise);

  await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));
  await coursesPage.clickCourseByTitle(courseData.title);
  await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+$`));

  return courseId;
}

test.describe('Adding Units to a Course', () => {
  let courseCreatePage: CourseCreatePage;
  let coursesPage: CoursesPage;
  let courseDetailsPage: CourseDetailsPage;
  let apiFlow: ApiFlow;

  test.beforeEach(({ page }) => {
    courseCreatePage = new CourseCreatePage(page);
    coursesPage = new CoursesPage(page);
    courseDetailsPage = new CourseDetailsPage(page);
    apiFlow = new ApiFlow(page);
  });

  test('Verify that a teacher can add a unit to a course', async ({ page }) => {
    const unitData = createUnitFixture();
    let courseId: number | undefined;

    try {
      courseId = await createCourse(page, courseCreatePage, coursesPage, apiFlow);

      await courseDetailsPage.addUnitInline(unitData.title);

      await expect(courseDetailsPage.getUnitHeaderByTitle(unitData.title)).toBeVisible();
    } finally {
      if (courseId !== undefined) {
        await apiFlow.deleteCourse(courseId);
      }
    }
  });

  test('Verify that an error is shown when the unit title is left empty', async ({ page }) => {
    let courseId: number | undefined;

    try {
      courseId = await createCourse(page, courseCreatePage, coursesPage, apiFlow);

      await courseDetailsPage.openAddUnitForm();
      await courseDetailsPage.blurUnitTitle();

      await expect(courseDetailsPage.unitValidationError).toHaveText(UNIT_TITLE_REQUIRED_ERROR);
      await expect(courseDetailsPage.unitSaveButton).toBeDisabled();
    } finally {
      if (courseId !== undefined) {
        await apiFlow.deleteCourse(courseId);
      }
    }
  });
});

test.describe('Adding Lessons to a Unit', () => {
  let courseCreatePage: CourseCreatePage;
  let coursesPage: CoursesPage;
  let courseDetailsPage: CourseDetailsPage;
  let addLessonPage: AddLessonPage;
  let apiFlow: ApiFlow;

  test.beforeEach(({ page }) => {
    courseCreatePage = new CourseCreatePage(page);
    coursesPage = new CoursesPage(page);
    courseDetailsPage = new CourseDetailsPage(page);
    addLessonPage = new AddLessonPage(page);
    apiFlow = new ApiFlow(page);
  });

  async function createCourseWithUnit(page: Page): Promise<{ courseId: number; unitTitle: string }> {
    const unitData = createUnitFixture();
    const courseId = await createCourse(page, courseCreatePage, coursesPage, apiFlow);

    await courseDetailsPage.addUnitInline(unitData.title);
    const unitHeader = courseDetailsPage.getUnitHeaderByTitle(unitData.title);
    await expect(unitHeader).toBeVisible();

    await unitHeader.click();
    await expect(courseDetailsPage.addLessonButton).toBeVisible();

    return { courseId, unitTitle: unitData.title };
  }

  test('Verify that a teacher can add a lesson to a unit', async ({ page }) => {
    const lessonData = createLessonFixture();
    let courseId: number | undefined;

    try {
      const created = await createCourseWithUnit(page);
      courseId = created.courseId;

      await courseDetailsPage.addLessonButton.click();
      await expect(page).toHaveURL(new RegExp(`${ApiAddresses.units}/\\d+/lessons/new$`));

      await addLessonPage.fillAndSave(lessonData);

      await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}/details/\\d+$`));
      await courseDetailsPage.getUnitHeaderByTitle(created.unitTitle).click();
      await expect(courseDetailsPage.getLessonItem(lessonData.title)).toBeVisible();
    } finally {
      if (courseId !== undefined) {
        await apiFlow.deleteCourse(courseId);
      }
    }
  });

  test('Verify that submitting the lesson form with required fields empty does not create the lesson', async ({ page }) => {
    let courseId: number | undefined;

    try {
      const created = await createCourseWithUnit(page);
      courseId = created.courseId;

      await courseDetailsPage.addLessonButton.click();
      await expect(page).toHaveURL(new RegExp(`${ApiAddresses.units}/\\d+/lessons/new$`));

      await addLessonPage.submit();

      await expect(page).toHaveURL(new RegExp(`${ApiAddresses.units}/\\d+/lessons/new$`));
    } finally {
      if (courseId !== undefined) {
        await apiFlow.deleteCourse(courseId);
      }
    }
  });
});
