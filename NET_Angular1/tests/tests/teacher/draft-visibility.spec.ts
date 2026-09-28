/// <reference types="node" />

import * as path from 'path';
import { ApiAddresses } from '../../api/api-addresses';
import {
  expect,
  test,
} from '../../fixtures/draft-visibility.fixture';
import { ApiFlow } from '../../api/api-flow';

test.use({
  storageState: path.resolve(
    __dirname,
    '../../.auth/teacher.json',
  ),
});

test.describe('Draft content visibility', () => {

  let apiFlow: ApiFlow;
  test.beforeEach(async ({ page }): Promise<void> => {
    apiFlow = new ApiFlow(page);
    await page.goto(
      ApiAddresses.baseUrl + ApiAddresses.dashboard,
    );
  });

  test(
    'Verify if a draft test is visible to its teacher and hidden from students',
    async ({
      page,
      navbarPage,
      testsListPage,
      testCreatePage,
      testDetailPage,
      studentPage,
      studentNavbarPage,
      studentTestsListPage,
      draftTestData,
    }): Promise<void> => {
      let testWasCreated = false;
      let testId: number | undefined;
      try {
        await navbarPage.openTests();
        await testsListPage.waitUntilLoaded();
        await testsListPage.openCreateTest();

        await testCreatePage.createTest(draftTestData);
        testWasCreated = true;

        await expect(page).toHaveURL(
          /\/modules\/testing\/\d+\/questions$/,
        );
        testId = Number(page.url().match(/\/modules\/testing\/\d+\/questions$/)?.[0].match(/\d+/)?.[0]);
        await navbarPage.openTests();
        await testsListPage.waitUntilLoaded();

        await expect(
          testsListPage.getTeacherTestCard(
            draftTestData.title,
          ),
        ).toBeVisible();

        await expect(
          testsListPage.getDraftBadge(
            draftTestData.title,
          ),
        ).toBeVisible();

        await studentPage.goto(
          ApiAddresses.baseUrl +
            ApiAddresses.dashboard,
        );

        await studentNavbarPage.openTests();
        await studentTestsListPage.waitUntilLoaded();

        await expect(
          studentTestsListPage.getStudentTestCard(
            draftTestData.title,
          ),
        ).toHaveCount(0);
      } finally {
        if (testWasCreated) {
          await page.goto(
            ApiAddresses.baseUrl +
              ApiAddresses.dashboard,
          );

          await navbarPage.openTests();
          await testsListPage.waitUntilLoaded();

          const createdTest =
            testsListPage.getTeacherTestCard(
              draftTestData.title,
            );

          if ((await createdTest.count()) > 0) {
            await testsListPage.openTeacherTest(
              draftTestData.title,
            );

            await testDetailPage.deleteTest();
          }
        }
        if (testId !== undefined) {
          await apiFlow.deleteTest(testId);
        }
      }
    },
  );

  test(
    'Verify if a draft course is visible to its teacher and hidden from students',
    async ({
      page,
      navbarPage,
      courseListPage,
      courseCreatePage,
      courseDetailsPage,
      studentPage,
      studentNavbarPage,
      studentCourseListPage,
      draftCourseData,
    }): Promise<void> => {
      let courseWasCreated = false;

      try {
        await navbarPage.openCourses();
        await courseListPage.waitUntilLoaded();
        await courseListPage.openCreateCourse();

        await courseCreatePage.createCourse(
          draftCourseData,
        );

        courseWasCreated = true;

        await expect(page).toHaveURL(/\/courses\/?$/);
        await courseListPage.waitUntilLoaded();

        await expect(
          courseListPage.getCourseCard(
            draftCourseData.title,
          ),
        ).toBeVisible();

        await expect(
          courseListPage.getDraftBadge(
            draftCourseData.title,
          ),
        ).toBeVisible();

        await studentPage.goto(
          ApiAddresses.baseUrl +
            ApiAddresses.dashboard,
        );

        await studentNavbarPage.openCourses();
        await studentCourseListPage.waitUntilLoaded();

        await expect(
          studentCourseListPage.getCourseCard(
            draftCourseData.title,
          ),
        ).toHaveCount(0);
      } finally {
        if (courseWasCreated) {
          await page.goto(
            ApiAddresses.baseUrl +
              ApiAddresses.dashboard,
          );

          await navbarPage.openCourses();
          await courseListPage.waitUntilLoaded();

          const createdCourse =
            courseListPage.getCourseCard(
              draftCourseData.title,
            );

          if ((await createdCourse.count()) > 0) {
            await courseListPage.openCourse(
              draftCourseData.title,
            );

            await courseDetailsPage.deleteCourse();
          }
        }
      }
    },
  );
});