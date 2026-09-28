import { test, expect } from '@playwright/test';
import * as path from 'path';

import { NavbarPage, DashboardPage } from '../../pages';
import { TEACHER_EXPECTED_NAV_ITEMS, TEACHER_UNEXPECTED_NAV_ITEMS, NAV_LABELS, ROLE_BADGE_TEXT,} from '../../fixtures/navbar.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/teacher.json'),
});

test.describe('Teacher Navbar', () => {
  let navbarPage: NavbarPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    navbarPage = new NavbarPage(page);
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  for (const label of TEACHER_EXPECTED_NAV_ITEMS) {
    test(`Verify that the teacher navbar shows the ${label} link`, async () => {
      await expect(navbarPage.getNavItem(label)).toBeVisible();
    });
  }

  for (const label of TEACHER_UNEXPECTED_NAV_ITEMS) {
    test(`Verify that the teacher navbar does not show the ${label} link`, async () => {
      await expect(navbarPage.getNavItem(label)).toBeHidden();
    });
  }

  test("Verify that the teacher's name is displayed in the navbar", async () => {
    await expect(navbarPage.getUserName()).toBeVisible();
  });

  test('Verify that the teacher role badge shows Teacher', async () => {
    await expect(navbarPage.getRoleBadge()).toHaveText(ROLE_BADGE_TEXT.teacher);
  });

  test('Verify that clicking Home navigates to the dashboard', async ({ page }) => {
    await navbarPage.clickNavItem(NAV_LABELS.courses);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));

    await navbarPage.clickNavItem(NAV_LABELS.home);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.dashboard}$`));
  });

  test('Verify that clicking Tests navigates to the tests page', async ({ page }) => {
    await navbarPage.clickNavItem(NAV_LABELS.tests);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.testing}$`));
  });

  test('Verify that clicking Courses navigates to the courses page', async ({ page }) => {
    await navbarPage.clickNavItem(NAV_LABELS.courses);
    await expect(page).toHaveURL(new RegExp(`${ApiAddresses.courses}$`));
  });

  test('Verify that clicking My Profile opens the profile panel', async () => {
    await navbarPage.clickNavItem(NAV_LABELS.myProfile);
    await expect(navbarPage.getProfilePanel()).toHaveClass(/open/);
  });
});
