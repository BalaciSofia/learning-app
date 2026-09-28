import { test, expect } from '@playwright/test';
import * as path from 'path';

import { DashboardPage } from '../../pages';
import { WELCOME_TEXT } from '../../fixtures/dashboard.fixture';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/user.json'),
});

test.describe('Basic User Dashboard', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('Verify that the basic user dashboard shows no action boxes', async () => {
    await expect(dashboardPage.getAllQuickLinks()).toHaveCount(0);
  });

  test('Verify that the basic user dashboard shows a welcome message with their name', async () => {
    await expect(dashboardPage.getHeroTitle()).toContainText(WELCOME_TEXT);
  });

  test('Verify that the basic user dashboard tells them a role will be assigned shortly', async () => {
    await expect(dashboardPage.getUnassignedRoleMessage()).toBeVisible();
  });
});
