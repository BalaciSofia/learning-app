import { test, expect } from '@playwright/test';
import * as path from 'path';

import { NavbarPage, DashboardPage } from '../../pages';
import { ROLE_BADGE_TEXT } from '../../fixtures/navbar.fixture';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/user.json'),
});

test.describe('Basic User Navbar', () => {
  let navbarPage: NavbarPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    navbarPage = new NavbarPage(page);
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('Verify that the basic user navbar shows no navigation links', async () => {
    await expect(navbarPage.getAllNavItems()).toHaveCount(0);
  });

  test("Verify that the basic user's name is displayed in the navbar", async () => {
    await expect(navbarPage.getUserName()).toBeVisible();
  });

  test('Verify that the basic user role badge shows Basic', async () => {
    await expect(navbarPage.getRoleBadge()).toHaveText(ROLE_BADGE_TEXT.basic);
  });
});
