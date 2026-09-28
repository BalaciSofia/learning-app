import { expect, Locator, Page } from '@playwright/test';

export class PreviousAttemptsPage {
  private readonly page: Page;
  private readonly loadingSpinner: Locator;
  private readonly attemptsContainer: Locator;
  private readonly attemptCards: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.loadingSpinner = page.locator('app-loading-spinner');
    this.attemptsContainer = page.locator('.previous-attempts-card');
    this.attemptCards = page.locator('.attempt-card');
  }

  public async waitUntilLoaded(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
    await expect(this.attemptsContainer).toBeVisible();
  }

  public getAttemptCard(attemptNumber: number): Locator {
    return this.attemptCards.filter({
      has: this.page.getByRole('heading', {
        name: `Attempt #${attemptNumber}`,
        exact: true,
      }),
    });
  }

  public getAttemptScore(attemptNumber: number): Locator {
    return this.getAttemptCard(attemptNumber)
      .locator('.attempt-score')
      .filter({
        hasText: 'Score',
      })
      .locator('strong');
  }

  public getAttemptPercentage(
    attemptNumber: number
  ): Locator {
    return this.getAttemptCard(attemptNumber)
      .locator('.attempt-score')
      .filter({
        hasText: 'Percentage',
      })
      .locator('strong');
  }

  public async openAttemptResult(
    attemptNumber: number
  ): Promise<void> {
    const attemptCard = this.getAttemptCard(attemptNumber);

    await expect(attemptCard).toBeVisible();

    await attemptCard
      .getByRole('button', {
        name: 'View result',
        exact: true,
      })
      .click();
  }
}