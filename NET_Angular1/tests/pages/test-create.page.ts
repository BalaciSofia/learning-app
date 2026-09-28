import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';
import { TestFixtureData } from '../fixtures/test.fixture';

export class TestCreatePage {
  private readonly page: Page;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly retakeCheckbox: Locator;
  private readonly saveButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('#title');
    this.descriptionInput = page.locator('#description');
    this.retakeCheckbox = page.locator('input[type="checkbox"]');
    this.saveButton = page.locator('button[type="submit"]');
  }

  public async goto(): Promise<void> {
    await this.page.goto(
      ApiAddresses.baseUrl + ApiAddresses.createTest
    );
  }

  public async createTest(testData: TestFixtureData): Promise<void> {
    await this.titleInput.fill(testData.title);
    await this.descriptionInput.fill(testData.description);

    if (testData.isRetakeAllowed) {
      await this.retakeCheckbox.check();
    } else {
      await this.retakeCheckbox.uncheck();
    }

    await this.saveButton.click();
  }

  public async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.titleInput.dispatchEvent('blur');
  }

  public async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
    await this.descriptionInput.dispatchEvent('blur');
  }

  public async submit(): Promise<void> {
    await this.saveButton.click();
  }

  public getSaveButton(): Locator {
    return this.saveButton;
  }

  public fieldError(fieldId: 'title' | 'description'): Locator {
    return this.page.locator(`#${fieldId} ~ .field-error`);
  }
}