/// <reference types="node" />

import {
  expect,
  Page,
  test as base,
} from '@playwright/test';
import * as path from 'path';
import { NavbarPage, TestsListPage, TestCreatePage, TestDetailPage, CourseListPage, CourseCreatePage, CourseDetailsPage,} from '../pages';
import { createTestFixture, TestFixtureData,} from './test.fixture';
import { CourseFixtureData, createCourseFixture,} from './course.fixture';

interface DraftVisibilityFixtures {
  readonly navbarPage: NavbarPage;
  readonly testsListPage: TestsListPage;
  readonly testCreatePage: TestCreatePage;
  readonly testDetailPage: TestDetailPage;
  readonly courseListPage: CourseListPage;
  readonly courseCreatePage: CourseCreatePage;
  readonly courseDetailsPage: CourseDetailsPage;
  readonly studentPage: Page;
  readonly studentNavbarPage: NavbarPage;
  readonly studentTestsListPage: TestsListPage;
  readonly studentCourseListPage: CourseListPage;
  readonly draftTestData: TestFixtureData;
  readonly draftCourseData: CourseFixtureData;
}

export const test = base.extend<DraftVisibilityFixtures>({
  navbarPage: async ({ page }, use): Promise<void> => {
    await use(new NavbarPage(page));
  },

  testsListPage: async ({ page }, use): Promise<void> => {
    await use(new TestsListPage(page));
  },

  testCreatePage: async ({ page }, use): Promise<void> => {
    await use(new TestCreatePage(page));
  },

  testDetailPage: async ({ page }, use): Promise<void> => {
    await use(new TestDetailPage(page));
  },

  courseListPage: async ({ page }, use): Promise<void> => {
    await use(new CourseListPage(page));
  },

  courseCreatePage: async ({ page }, use): Promise<void> => {
    await use(new CourseCreatePage(page));
  },

  courseDetailsPage: async ({ page }, use): Promise<void> => {
    await use(new CourseDetailsPage(page));
  },

  studentPage: async ({ browser }, use): Promise<void> => {
    const studentContext = await browser.newContext({
      storageState: path.resolve(
        __dirname,
        '../.auth/student.json',
      ),
    });

    const studentPage = await studentContext.newPage();

    try {
      await use(studentPage);
    } finally {
      await studentContext.close();
    }
  },

  studentNavbarPage: async (
    { studentPage },
    use,
  ): Promise<void> => {
    await use(new NavbarPage(studentPage));
  },

  studentTestsListPage: async (
    { studentPage },
    use,
  ): Promise<void> => {
    await use(new TestsListPage(studentPage));
  },

  studentCourseListPage: async (
    { studentPage },
    use,
  ): Promise<void> => {
    await use(new CourseListPage(studentPage));
  },

  draftTestData: async ({}, use): Promise<void> => {
    await use(createTestFixture());
  },

  draftCourseData: async ({}, use): Promise<void> => {
    await use(createCourseFixture());
  },
});

export { expect };