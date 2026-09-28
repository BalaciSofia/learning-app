import { test, expect } from '@playwright/test';
import * as path from 'path';

import { BattlesPage, TakeDuelPage } from '../../pages';
import { MOCK_INVITATIONS, MOCK_ACTIVE_DUELS, MOCK_HISTORY, MOCK_DUEL_TEST_QUESTIONS } from '../../fixtures/battles.fixture';
import { ApiAddresses } from '../../api/api-addresses';

test.use({
  storageState: path.resolve(__dirname, '../../.auth/student.json'),
});

test.describe('Student Battles / Duels', () => {
  let battlesPage: BattlesPage;
  let takeDuelPage: TakeDuelPage;

  test.beforeEach(async ({ page }) => {
    battlesPage = new BattlesPage(page);
    takeDuelPage = new TakeDuelPage(page);
  });

  test('Verify dashboard displays empty state when there are no invitations, active duels, or history', async ({ page }) => {
    await page.route(`**${ApiAddresses.apiDuelsInvitations}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsActive}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsHistory}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await battlesPage.goto();

    await expect(battlesPage.getInvitations()).toHaveCount(0);
    await expect(battlesPage.getActiveDuels()).toHaveCount(0);
    await expect(battlesPage.getHistoryItems()).toHaveCount(0);
    await expect(battlesPage.getEmptyStates()).toHaveCount(3);
  });

  test('Verify dashboard displays incoming invitations and allows accepting an invitation', async ({ page }) => {
    await page.route(`**${ApiAddresses.apiDuelsInvitations}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_INVITATIONS) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      }
    });
    await page.route(`**${ApiAddresses.apiDuelsActive}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsHistory}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await battlesPage.goto();

    await expect(battlesPage.getInvitations()).toHaveCount(1);
    await expect(battlesPage.getAcceptButton(0)).toBeVisible();
    await expect(battlesPage.getRejectButton(0)).toBeVisible();

    await battlesPage.getAcceptButton(0).click();
  });

  test('Verify dashboard displays active duels and allows navigating to play a duel', async ({ page }) => {
    await page.route(`**${ApiAddresses.apiDuelsInvitations}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsActive}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ACTIVE_DUELS) });
    });
    await page.route(`**${ApiAddresses.apiDuelsHistory}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**/api/tests/${MOCK_ACTIVE_DUELS[0].testId}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DUEL_TEST_QUESTIONS) });
    });

    await battlesPage.goto();

    await expect(battlesPage.getActiveDuels()).toHaveCount(1);
    await expect(battlesPage.getPlayButton(0)).toBeVisible();

    await battlesPage.getPlayButton(0).click();
    await expect(page).toHaveURL(new RegExp(`/battles/take/${MOCK_ACTIVE_DUELS[0].id}/${MOCK_ACTIVE_DUELS[0].testId}`));
  });

  test('Verify duel history renders past matches correctly', async ({ page }) => {
    await page.route(`**${ApiAddresses.apiDuelsInvitations}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsActive}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**${ApiAddresses.apiDuelsHistory}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_HISTORY) });
    });

    await battlesPage.goto();

    await expect(battlesPage.getHistoryItems()).toHaveCount(1);
    await expect(battlesPage.getHistoryItems().first()).toContainText('TypeScript Essentials');
    await expect(battlesPage.getHistoryItems().first()).toContainText('Current User Won');
  });

  test('Verify taking a duel interface allows selecting answers and submitting', async ({ page }) => {
    const duelId = MOCK_ACTIVE_DUELS[0].id;
    const testId = MOCK_ACTIVE_DUELS[0].testId;

    await page.route(`**/api/tests/${testId}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DUEL_TEST_QUESTIONS) });
    });
    await page.route(`**${ApiAddresses.apiDuelsActive}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ACTIVE_DUELS) });
    });
    await page.route(`**/api/duels/${duelId}/result`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isCompleted: false,
          message: 'Your score has been recorded!'
        })
      });
    });

    await page.goto(`${ApiAddresses.baseUrl}/battles/take/${duelId}/${testId}`);

    await expect(takeDuelPage.getQuizCard()).toBeVisible();
    await expect(takeDuelPage.getQuestionTitle()).toHaveText('What is Angular?');

    await takeDuelPage.selectAnswer(0);
    await takeDuelPage.getNextButton().click();

    await expect(takeDuelPage.getResultCard()).toBeVisible();
    await expect(takeDuelPage.getResultCard()).toContainText('Your score has been recorded!');
  });
});
