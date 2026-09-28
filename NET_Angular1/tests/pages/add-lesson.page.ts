import { Locator, Page } from '@playwright/test';
import { LessonFixtureData } from '../fixtures/lesson.fixture';

export class AddLessonPage {
  private readonly page: Page;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly durationInput: Locator;
  private readonly typeSelect: Locator;
  private readonly videoUrlInput: Locator;
  private readonly saveButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('input[formControlName="title"]');
    this.descriptionInput = page.locator('input[formControlName="description"]');
    this.durationInput = page.locator('input[formControlName="duration"]');
    this.typeSelect = page.locator('select[formControlName="type"]');
    this.videoUrlInput = page.locator('input[formControlName="videoUrl"]');
    this.saveButton = page.locator('button.save-btn');
  }

  public async fillAndSave(lessonData: LessonFixtureData): Promise<void> {
    await this.titleInput.fill(lessonData.title);
    await this.descriptionInput.fill(lessonData.description);
    await this.durationInput.fill(lessonData.duration.toString());
    await this.typeSelect.selectOption(lessonData.type);

    if (lessonData.videoUrl && await this.videoUrlInput.isEnabled()) {
      await this.videoUrlInput.fill(lessonData.videoUrl);
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

  public async fillDuration(duration: string): Promise<void> {
    await this.durationInput.fill(duration);
    await this.durationInput.dispatchEvent('blur');
  }

  public async submit(): Promise<void> {
    await this.saveButton.click();
  }
}
