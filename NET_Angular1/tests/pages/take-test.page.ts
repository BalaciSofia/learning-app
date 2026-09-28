import { expect, Locator, Page } from '@playwright/test';

export class TakeTestPage {
  private readonly page: Page;
  private readonly loadingSpinner: Locator;
  private readonly questionBlock: Locator;
  private readonly answersList: Locator;
  private readonly nextButton: Locator;
  private readonly submitButton: Locator;
  private readonly answerRequiredMessage: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.loadingSpinner = page.locator('app-loading-spinner');
    this.questionBlock = page.locator('.question-block');
    this.answersList = page.locator('.answers-list');

    this.nextButton = page.getByRole(
      'button',
      {
        name: 'Next',
        exact: true,
      },
    );

    this.submitButton = page.getByRole(
      'button',
      {
        name: 'Submit test',
        exact: true,
      },
    );

    this.answerRequiredMessage = page
      .locator('.toast.error')
      .filter({ hasText: 'Please select an answer.' });
  }

  public async waitUntilLoaded(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
    await expect(this.questionBlock).toBeVisible();
  }

  public getQuestion(questionText: string): Locator {
    return this.questionBlock.getByRole('heading', {
      name: questionText,
      exact: true,
    });
  }

  public getQuestionProgress(
    currentQuestion: number,
    totalQuestions: number
  ): Locator {
    return this.page.getByText(
      `Question ${currentQuestion} of ${totalQuestions}`,
      { exact: true }
    );
  }

  public getAnswerRequiredMessage(): Locator {
    return this.answerRequiredMessage;
  }

  public async selectAnswer(answerText: string): Promise<void> {
    await this.answersList.getByRole('button', {
      name: answerText,
      exact: true,
    }).click();
  }

  public async goToNextQuestion(): Promise<void> {
    await this.nextButton.click();
  }

  public async submitTest(): Promise<void> {
    await this.submitButton.click();
  }
}