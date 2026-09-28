import { expect, Locator, Page, Response } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class TestDetailPage {
  private readonly page: Page;
  private readonly questionCards: Locator;
  private readonly confirmDeleteBtn: Locator;
  private readonly publishBtn: Locator;
  private readonly deleteTestButton: Locator;
  private readonly deleteTestDialog: Locator;
  private readonly confirmDeleteTestButton: Locator;
  private readonly previousAttemptsButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.questionCards = page.locator('.question-card');
    this.confirmDeleteBtn = page.locator(
      'app-confirm-dialog button',
      { hasText: 'Delete' },
    );
    this.publishBtn = page.getByRole(
      'button',
      { name: /Publish test|Publishing/ },
    );

    this.deleteTestButton = page.getByRole(
      'button',
      {
        name: 'Delete test',
        exact: true,
      },
    );

    this.deleteTestDialog = page.getByRole(
      'dialog',
      {
        name: 'Delete test?',
        exact: true,
      },
    );

    this.confirmDeleteTestButton = this.deleteTestDialog.getByRole(
      'button',
      {
        name: 'Delete',
        exact: true,
      },
    );

    this.previousAttemptsButton = page.getByRole(
      'button',
      {
        name: 'Previous attempts',
        exact: true,
      },
    );
  }

  public async goto(testId: number): Promise<void> {
    await this.page.goto(`${ApiAddresses.baseUrl}${ApiAddresses.testing}/${testId}`);
  }

  public async openPreviousAttempts(): Promise<void> {
    await this.previousAttemptsButton.click();
  }

  public async publishTest(): Promise<Response> {
    const publishPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/publish$`);
    const responsePromise = this.page.waitForResponse(
      res => publishPattern.test(res.url()) && res.request().method() === 'PATCH'
    );
    await this.publishBtn.click();
    return responsePromise;
  }

  public async deleteTest(): Promise<void> {
    await this.deleteTestButton.click();
    await expect(this.deleteTestDialog).toBeVisible();
    await this.confirmDeleteTestButton.click();

    await expect(this.page).toHaveURL(
      `${ApiAddresses.baseUrl}${ApiAddresses.tests}`,
    );
  }

  private async waitForLoaded(): Promise<void> {
    await this.page.locator('.questions-list').waitFor({ state: 'attached' });
  }

  private async findQuestionCardIndex(questionText: string): Promise<number> {
    await this.page.locator('.question-text', { hasText: questionText }).waitFor({ state: 'visible' });

    const count = await this.questionCards.count();

    for (let i = 0; i < count; i++) {
      const text = await this.questionCards.nth(i).locator('.question-text').innerText();
      if (text.includes(questionText)) {
        return i;
      }
    }

    throw new Error(`Question containing text "${questionText}" was not found.`);
  }

  private async findAnswerRowIndex(card: Locator, answerText: string): Promise<number> {
    const rows = card.locator('.answer-row');
    await rows.filter({ hasText: answerText }).first().waitFor({ state: 'visible' });

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('.answer-text').innerText();
      if (text.includes(answerText)) {
        return i;
      }
    }

    throw new Error(`Answer containing text "${answerText}" was not found.`);
  }

  public async isQuestionVisible(questionText: string): Promise<boolean> {
    await this.waitForLoaded();
    const count = await this.questionCards.count();

    for (let i = 0; i < count; i++) {
      const text = await this.questionCards.nth(i).locator('.question-text').innerText();
      if (text.includes(questionText)) {
        return true;
      }
    }

    return false;
  }

  public async cancelQuestionEdit(questionText: string, attemptedText: string): Promise<void> {
    const index = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(index);

    await card.locator('button[aria-label="Edit question"]').click();
    await card.locator('textarea').fill(attemptedText);
    await card.locator('button', { hasText: 'Cancel' }).first().click();
  }

  public async cancelAnswerEdit(questionText: string, answerText: string, attemptedText: string): Promise<void> {
    const questionIndex = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(questionIndex);

    await card.locator('button[aria-label="Edit question"]').click();

    const answerIndex = await this.findAnswerRowIndex(card, answerText);
    const answerRow = card.locator('.answer-row').nth(answerIndex);
    await answerRow.locator('button[aria-label="Edit answer"]').click();

    await answerRow.locator('input[type="text"]').fill(attemptedText);
    await answerRow.locator('button', { hasText: 'Cancel' }).click();

    await card.locator('button', { hasText: 'Cancel' }).first().click();
  }

  public async editQuestionText(questionText: string, newText: string): Promise<Response> {
    const index = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(index);

    await card.locator('button[aria-label="Edit question"]').click();

    const questionUpdatedPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/questions/\\d+$`);
    const responsePromise = this.page.waitForResponse(
      res => questionUpdatedPattern.test(res.url()) && res.request().method() === 'PUT'
    );

    await card.locator('textarea').fill(newText);
    await card.locator('button[type="submit"]').click();
    return responsePromise;
  }

  public async deleteQuestion(questionText: string): Promise<Response> {
    const index = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(index);

    await card.locator('button[aria-label="Delete question"]').click();

    const questionDeletedPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/questions/\\d+$`);
    const responsePromise = this.page.waitForResponse(
      res => questionDeletedPattern.test(res.url()) && res.request().method() === 'DELETE'
    );
    await this.confirmDeleteBtn.click();
    return responsePromise;
  }

  public async isAnswerVisible(questionText: string, answerText: string): Promise<boolean> {
    const index = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(index);
    return (await card.locator('.answer-row').filter({ hasText: answerText }).count()) > 0;
  }

  public async editAnswerText(questionText: string, answerText: string, newAnswerText: string): Promise<Response> {
    const questionIndex = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(questionIndex);

    await card.locator('button[aria-label="Edit question"]').click();

    const answerIndex = await this.findAnswerRowIndex(card, answerText);
    const answerRow = card.locator('.answer-row').nth(answerIndex);
    await answerRow.locator('button[aria-label="Edit answer"]').click();

    const answerUpdatedPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/questions/\\d+/answers/\\d+$`);
    const responsePromise = this.page.waitForResponse(
      res => answerUpdatedPattern.test(res.url()) && res.request().method() === 'PUT'
    );

    await answerRow.locator('input[type="text"]').fill(newAnswerText);
    await answerRow.locator('button[type="submit"]').click();
    const response = await responsePromise;

    await card.locator('button', { hasText: 'Cancel' }).first().click();
    return response;
  }

  public async deleteAnswer(questionText: string, answerText: string): Promise<Response> {
    const questionIndex = await this.findQuestionCardIndex(questionText);
    const card = this.questionCards.nth(questionIndex);

    await card.locator('button[aria-label="Edit question"]').click();

    const answerIndex = await this.findAnswerRowIndex(card, answerText);
    const answerRow = card.locator('.answer-row').nth(answerIndex);
    await answerRow.locator('button[aria-label="Delete answer"]').click();

    const answerDeletedPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/questions/\\d+/answers/\\d+$`);
    const responsePromise = this.page.waitForResponse(
      res => answerDeletedPattern.test(res.url()) && res.request().method() === 'DELETE'
    );
    await this.confirmDeleteBtn.click();
    const response = await responsePromise;

    await card.locator('button', { hasText: 'Cancel' }).first().click();
    return response;
  }
}
