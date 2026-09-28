import { Locator, Page, Response } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';
import { AnswerFixtureData } from '../fixtures/question.fixture';

export class QuestionBuilderPage {
  private readonly page: Page;
  private readonly textArea: Locator;
  private readonly manualModeBtn: Locator;
  private readonly aiModeBtn: Locator;
  private readonly correctAnswerInput: Locator;
  private readonly generateBtn: Locator;
  private readonly addAnswerBtn: Locator;
  private readonly answerRows: Locator;
  private readonly saveButton: Locator;
  private readonly finishButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.textArea = page.locator('#text');
    this.manualModeBtn = page.getByRole('button', { name: 'Manual' });
    this.aiModeBtn = page.getByRole('button', { name: 'AI Generated' });
    this.correctAnswerInput = page.locator('#correct-answer');
    this.generateBtn = page.getByRole('button', { name: /Generate with AI|Generating/ });
    this.addAnswerBtn = page.getByRole('button', { name: 'Add answer' });
    this.answerRows = page.locator('.answer-row');
    this.saveButton = page.locator('button[type="submit"]');
    this.finishButton = page.getByRole('button', { name: 'Finish adding questions' });
  }

  public async goto(testId: number): Promise<void> {
    await this.page.goto(`${ApiAddresses.baseUrl}${ApiAddresses.testing}/${testId}/questions`);
  }

  public async fillQuestionText(text: string): Promise<void> {
    await this.textArea.fill(text);
  }

  public async selectType(type: 'single' | 'multiple'): Promise<void> {
    const label = type === 'single' ? 'Single choice' : 'Multiple choice';
    await this.page.getByRole('radio', { name: label }).check();
  }

  public async setManualMode(): Promise<void> {
    await this.manualModeBtn.click();
  }

  public async setAiMode(): Promise<void> {
    await this.aiModeBtn.click();
  }

  public async fillAnswerRow(index: number, text: string, isCorrect: boolean): Promise<void> {
    const row = this.answerRows.nth(index);
    await row.locator('input[type="text"]').fill(text);

    const checkbox = row.locator('input[type="checkbox"]');
    if (isCorrect) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  public async addAnswerRow(): Promise<void> {
    await this.addAnswerBtn.click();
  }

  public async removeAnswerRow(index: number): Promise<void> {
    await this.answerRows.nth(index).getByRole('button', { name: 'Remove' }).click();
  }

  public getAddAnswerButton(): Locator {
    return this.addAnswerBtn;
  }

  public getRemoveButtonForRow(index: number): Locator {
    return this.answerRows.nth(index).getByRole('button', { name: 'Remove' });
  }

  public async fillManualAnswers(answers: AnswerFixtureData[]): Promise<void> {
    const currentCount = await this.answerRows.count();

    for (let i = currentCount; i < answers.length; i++) {
      await this.addAnswerRow();
    }

    for (let i = 0; i < answers.length; i++) {
      await this.fillAnswerRow(i, answers[i].text, answers[i].isCorrect);
    }
  }

  public async fillCorrectAnswer(text: string): Promise<void> {
    await this.correctAnswerInput.fill(text);
  }

  public async generateDistractors(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      res => res.url().includes(`${ApiAddresses.apiTests}/generate-distractors`) && res.request().method() === 'POST'
    );
    await this.generateBtn.click();
    return responsePromise;
  }

  public async clickGenerateWithoutWaiting(): Promise<void> {
    await this.generateBtn.click();
  }

  public getCorrectAnswerFieldError(): Locator {
    return this.page.locator('#correct-answer ~ .field-error');
  }

  public async submitQuestion(): Promise<Response> {
    const questionsCreatedPattern = new RegExp(`${ApiAddresses.apiTests}/\\d+/questions$`);
    const responsePromise = this.page.waitForResponse(
      res => questionsCreatedPattern.test(res.url()) && res.request().method() === 'POST'
    );
    await this.saveButton.click();
    return responsePromise;
  }

  public async finish(): Promise<void> {
    await this.finishButton.click();
  }

  public async getAnswerRowCount(): Promise<number> {
    return this.answerRows.count();
  }

  public getAnswerRowsLocator(): Locator {
    return this.answerRows;
  }

  public async getAnswerRowText(index: number): Promise<string> {
    return this.answerRows.nth(index).locator('input[type="text"]').inputValue();
  }

  public getSaveButton(): Locator {
    return this.saveButton;
  }
}
