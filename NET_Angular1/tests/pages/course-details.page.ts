import { Page, Locator, expect } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class CourseDetailsPage {
  private readonly page: Page;
  public readonly addUnitButton: Locator;
  public readonly editButtons: Locator;
  public readonly deleteButtons: Locator;
  public readonly progressText: Locator;
  public readonly progressSection: Locator;
  public readonly enrollmentBanner: Locator;
  public readonly markCompleteButtons: Locator;
  public readonly completedBadges: Locator;
  public readonly enrollButton: Locator;
  public readonly unitHeaders: Locator;
  public readonly publishButton: Locator;
  public readonly publishedBadge: Locator; 
  public readonly addLessonButton: Locator;
  public readonly unitTitleInput: Locator;
  public readonly unitDescriptionInput: Locator;
  public readonly unitSaveButton: Locator;
  private readonly deleteCourseButton: Locator;
  private readonly deleteCourseDialog: Locator;
  private readonly confirmDeleteCourseButton: Locator;
  public readonly unitValidationError: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.enrollButton = page.locator('button', { hasText: 'Enroll Now' });
    this.unitHeaders = page.locator('.unit-header');
    this.addUnitButton = page.locator('button', { hasText: '+ Add Unit' });
    this.editButtons = page.locator('button', { hasText: 'Edit' });
    this.deleteButtons = page.locator('button', { hasText: 'Delete' });
    this.progressText = page.locator('.progress-count');
    this.progressSection = page.locator('.progress-section');
    this.enrollmentBanner = page.locator('.enrollment-banner');
    this.markCompleteButtons = page.locator('.btn-complete-lesson');
    this.completedBadges = page.locator('.lesson-completed-badge');
    this.publishButton = page.locator('button', { hasText: 'Publish Course' });
    this.publishedBadge = page.locator('.published-badge');
    this.addLessonButton = page.locator('button', { hasText: '+ Lesson' });
    this.unitTitleInput = page.locator('input.edit-input[formControlName="title"]');
    this.unitDescriptionInput = page.locator('input.edit-input[formControlName="description"]');
    this.unitSaveButton = page.locator('button.btn-save');
    this.deleteCourseButton = page.getByRole('button', {
      name: 'Delete Course',
      exact: true,
    });

    this.deleteCourseDialog = page
      .locator('.confirmation-dialog')
      .filter({
        has: page.getByRole('heading', {
          name: 'Delete course?',
          exact: true,
        }),
      });

    this.confirmDeleteCourseButton =
      this.deleteCourseDialog.getByRole('button', {
        name: 'Delete',
        exact: true,
      });
    this.unitValidationError = page.locator('.validation-error');
  }

  public async getProgressText(): Promise<string> {
    return (await this.progressText.textContent()) || '';
  }

  public async goto(courseId: number): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.courses + '/details/' + courseId);
  }

  public async getUncompletedLessonMarkCompleteButton(): Promise<Locator> {
    return this.markCompleteButtons.filter({ hasNotText: 'Saving...' }).first();
  }

  public getUnitHeaderByTitle(title: string): Locator {
    return this.page.locator('.unit-header', { hasText: title });
  }

  public getLessonItem(title: string): Locator {
    return this.page.locator('.lesson-item', { hasText: title });
  }

  public async addUnitInline(title: string): Promise<void> {
    await this.addUnitButton.click();
    await this.unitTitleInput.fill(title);
    await this.unitSaveButton.click();
    await this.unitSaveButton.waitFor({ state: 'detached' });
  }

  public async openAddUnitForm(): Promise<void> {
    await this.addUnitButton.click();
  }

  public async fillUnitTitle(title: string): Promise<void> {
    await this.unitTitleInput.fill(title);
    await this.unitTitleInput.dispatchEvent('blur');
  }

  public async blurUnitTitle(): Promise<void> {
    await this.unitTitleInput.click();
    await this.unitTitleInput.dispatchEvent('blur');
  }

  public async fillUnitDescription(description: string): Promise<void> {
    await this.unitDescriptionInput.fill(description);
    await this.unitDescriptionInput.dispatchEvent('blur');
  }

  public async publishCourse(): Promise<void> {
    await this.publishButton.click();
    await expect(this.publishedBadge).toBeVisible();
  }

  public async deleteCourse(): Promise<void> {
    await this.deleteCourseButton.click();
    await expect(this.deleteCourseDialog).toBeVisible();
    await this.confirmDeleteCourseButton.click();
    await expect(this.page).toHaveURL(new RegExp(`${ApiAddresses.courses}/?$`));
  }
}
