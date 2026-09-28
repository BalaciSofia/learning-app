import { expect, Locator, Page } from '@playwright/test';

export class TestResultPage {
  private readonly loadingSpinner: Locator;
  private readonly resultCard: Locator;
  private readonly resultStatus: Locator;
  private readonly totalScore: Locator;
  private readonly percentage: Locator;
  private readonly correctAnswers: Locator;
  private readonly previousAttemptsButton: Locator;

  public constructor(page: Page) {
    this.loadingSpinner = page.locator('app-loading-spinner');
    this.resultCard = page.locator('.test-result-card');
    this.resultStatus = page.locator('.result-status');

    this.totalScore = page
      .locator('.score-item')
      .filter({ hasText: 'Total score' })
      .locator('strong');

    this.percentage = page
      .locator('.score-item')
      .filter({ hasText: 'Percentage' })
      .locator('strong');

    this.correctAnswers = page
      .locator('.score-item')
      .filter({ hasText: 'Correct answers' })
      .locator('strong');

    this.previousAttemptsButton = page.getByRole('button', {
      name: 'Previous attempts',
      exact: true,
    });
  }

  public async waitUntilLoaded(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
    await expect(this.resultCard).toBeVisible();
  }

  public getResultStatus(): Locator {
    return this.resultStatus;
  }

  public getTotalScore(): Locator {
    return this.totalScore;
  }

  public getPercentage(): Locator {
    return this.percentage;
  }

  public getCorrectAnswers(): Locator {
    return this.correctAnswers;
  }

  public async openPreviousAttempts(): Promise<void> {
    await this.previousAttemptsButton.click();
  }
}