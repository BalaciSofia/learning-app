import { test, expect } from '@playwright/test';
import * as path from 'path';

import { DashboardPage } from '../../pages';
import { STUDENT_DASHBOARD_BOXES, DASHBOARD_BOX_TITLES } from '../../fixtures/dashboard.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/student.json'),
});

test.describe('Student Dashboard', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('Verify that the student dashboard shows exactly three boxes', async () => {
    await expect(dashboardPage.getAllQuickLinks()).toHaveCount(3);
  });

  for (const title of STUDENT_DASHBOARD_BOXES) {
    test(`Verify that the student dashboard shows the ${title} box`, async () => {
      await expect(dashboardPage.getQuickLink(title)).toBeVisible();
    });
  }

  test('Verify that clicking the Tests box navigates to the tests page', async ({ page }) => {
    await dashboardPage.getQuickLink(DASHBOARD_BOX_TITLES.tests).click();
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.testing}$`));
  });

  test('Verify that clicking the Courses box navigates to the courses page', async ({ page }) => {
    await dashboardPage.getQuickLink(DASHBOARD_BOX_TITLES.courses).click();
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));
  });

  test('Verify that clicking the Battle box navigates to the battles page', async ({ page }) => {
    await dashboardPage.getQuickLink(DASHBOARD_BOX_TITLES.battle).click();
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.battles}$`));
  });
});
