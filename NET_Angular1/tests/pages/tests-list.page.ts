import { expect, Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class TestsListPage {
  private readonly page: Page;
  private readonly testsContainer: Locator;
  private readonly loadingSpinner: Locator;
  private readonly addTestLink: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.testsContainer = page.locator('section.tests-shell');
    this.loadingSpinner = page.locator('app-loading-spinner');
    this.addTestLink = page.getByRole('link', {
      name: 'Add test',
      exact: true,
    });
  }

  public getTeacherTestCard(title: string): Locator {
    return this.page
      .locator('app-teacher-test-summary-card')
      .filter({
        has: this.page.getByRole('heading', {
          name: title,
          exact: true,
        }),
      });
  }

  public getStudentTestCard(title: string): Locator {
    return this.page
      .locator('app-test-summary-card')
      .filter({
        has: this.page.getByRole('heading', {
          name: title,
          exact: true,
        }),
      });
  }

  public getDraftBadge(title: string): Locator {
    return this.getTeacherTestCard(title).getByText('Draft', {
      exact: true,
    });
  }

  public async waitUntilLoaded(): Promise<void> {
    await expect(this.testsContainer).toBeVisible();
    await expect(this.loadingSpinner).toBeHidden();
  }

  public async openCreateTest(): Promise<void> {
    await this.addTestLink.click();
  }

  public async openTeacherTest(title: string): Promise<void> {
    await this.getTeacherTestCard(title)
      .getByRole('link')
      .click();
  }

  public async goto(): Promise<void> {
    await this.page.goto(`${ApiAddresses.baseUrl}${ApiAddresses.tests}`);
    await this.waitUntilLoaded();
  }

  public async openStudentTest(title: string): Promise<void> {
    const testCard = this.getStudentTestCard(title);

    await expect(testCard).toBeVisible();

    await testCard
      .getByRole('button', {
        name: 'Take test',
        exact: true,
      })
      .click();
  }
}