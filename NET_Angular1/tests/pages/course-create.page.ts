import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';
import { CourseFixtureData } from '../fixtures/course.fixture';

export class CourseCreatePage {
  private readonly page: Page;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly subjectInput: Locator;
  private readonly metadataInput: Locator;
  private readonly saveButton: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('#title');
    this.descriptionInput = page.locator('#description');
    this.subjectInput = page.locator('#subject');
    this.metadataInput = page.locator('#metadata');
    this.saveButton = page.locator('button[type="submit"]');
  }

  public async goto(): Promise<void> {
    await this.page.goto(
      ApiAddresses.baseUrl + ApiAddresses.createCourse
    );
  }

  public async createCourse(
    courseData: CourseFixtureData
  ): Promise<void> {
    await this.titleInput.fill(courseData.title);
    await this.descriptionInput.fill(courseData.description);
    await this.subjectInput.fill(courseData.subject);
    await this.metadataInput.fill(courseData.metadata);
    await this.saveButton.click();
  }

  public async fillTitle(title: string): Promise<void> {
    await this.titleInput.evaluate((el) => el.removeAttribute('maxlength'));
    await this.titleInput.fill(title);
    await this.titleInput.dispatchEvent('blur');
  }

  public async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.evaluate((el) => el.removeAttribute('maxlength'));
    await this.descriptionInput.fill(description);
    await this.descriptionInput.dispatchEvent('blur');
  }

  public async fillSubject(subject: string): Promise<void> {
    await this.subjectInput.evaluate((el) => el.removeAttribute('maxlength'));
    await this.subjectInput.fill(subject);
    await this.subjectInput.dispatchEvent('blur');
  }

  public async fillMetadata(metadata: string): Promise<void> {
    await this.metadataInput.evaluate((el) => el.removeAttribute('maxlength'));
    await this.metadataInput.fill(metadata);
    await this.metadataInput.dispatchEvent('blur');
  }

  public async submit(): Promise<void> {
    await this.saveButton.click();
  }

  public fieldError(fieldId: 'title' | 'description' | 'subject' | 'metadata'): Locator {
    return this.page.locator(`#${fieldId} ~ .field-error`);
  }
}