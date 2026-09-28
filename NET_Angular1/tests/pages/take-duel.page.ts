import { Locator, Page } from '@playwright/test';

export class TakeDuelPage {
  private readonly page: Page;
  private readonly quizCard: Locator;
  private readonly questionTitle: Locator;
  private readonly answerOptions: Locator;
  private readonly nextButton: Locator;
  private readonly cancelButton: Locator;
  private readonly resultCard: Locator;
  private readonly returnToDashboardButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.quizCard = page.locator('.quiz-card');
    this.questionTitle = page.locator('.question-title');
    this.answerOptions = page.locator('.answer-option');
    this.nextButton = page.locator('button.btn-next');
    this.cancelButton = page.locator('button.btn-cancel');
    this.resultCard = page.locator('.result-card');
    this.returnToDashboardButton = page.locator('.result-card button.btn-primary');
  }

  public getQuizCard(): Locator {
    return this.quizCard;
  }

  public getQuestionTitle(): Locator {
    return this.questionTitle;
  }

  public getAnswerOptions(): Locator {
    return this.answerOptions;
  }

  public getNextButton(): Locator {
    return this.nextButton;
  }

  public getCancelButton(): Locator {
    return this.cancelButton;
  }

  public getResultCard(): Locator {
    return this.resultCard;
  }

  public getReturnToDashboardButton(): Locator {
    return this.returnToDashboardButton;
  }

  public async selectAnswer(index: number): Promise<void> {
    await this.answerOptions.nth(index).click();
  }
}
