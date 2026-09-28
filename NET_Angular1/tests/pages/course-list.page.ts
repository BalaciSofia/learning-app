import { expect, Locator, Page } from '@playwright/test';

export class CourseListPage {
  private readonly page: Page;
  private readonly coursesContainer: Locator;
  private readonly loadingMessage: Locator;
  private readonly createCourseLink: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.coursesContainer = page.locator('section.courses-shell');

    this.loadingMessage = page.getByText('Loading courses...', {
      exact: true,
    });

    this.createCourseLink = page.getByRole(
      'link',
      {
        name: 'Create course',
        exact: true,
      },
    );
  }

  public getCourseCard(title: string): Locator {
    return this.page.locator('app-course-card').filter({
      has: this.page.getByRole('heading', {
        name: title,
        exact: true,
      }),
    });
  }

  public getCourseTitle(title: string): Locator {
    return this.getCourseCard(title).getByRole(
      'heading',
      {
        name: title,
        exact: true,
      },
    );
  }

  public getDraftBadge(title: string): Locator {
    return this.getCourseCard(title).getByText(
      'Draft',
      {
        exact: true,
      },
    );
  }

  public async waitUntilLoaded(): Promise<void> {
    await expect(this.coursesContainer).toBeVisible();
    await expect(this.loadingMessage).toBeHidden();
  }

  public async openCreateCourse(): Promise<void> {
    await this.createCourseLink.click();
  }

  public async openCourse(title: string): Promise<void> {
    await this.getCourseCard(title)
      .getByRole('link')
      .click();
  }
}