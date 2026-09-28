import { Page, Locator } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class CoursesPage {
  private readonly page: Page;
  public readonly courseCards: Locator;
  public readonly availableCoursesSection: Locator;
  public readonly enrolledCoursesSection: Locator;
  public readonly noAvailableCoursesMessage: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.courseCards = page.locator('app-course-card');
    this.availableCoursesSection = page
      .locator('.courses-section')
      .filter({
        has: page.locator('h2', { hasText: 'Available Courses' }),
      });
    this.enrolledCoursesSection = page
      .locator('.courses-section')
      .filter({
        has: page.locator('h2', { hasText: 'Enrolled Courses' }),
      });
    this.noAvailableCoursesMessage = page.locator(
      '.empty-state',
      { hasText: 'No available courses to enroll in.' },
    );
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.courses);
  }

  public async clickCourseByTitle(title: string): Promise<void> {
    await this.courseCards.filter({ hasText: title }).locator('.course-card-link').click();
  }
  
  public async clickFirstCourse(): Promise<void> {
    await this.courseCards.first().locator('.course-card-link').click();
  }

  public async clickFirstAvailableCourse(): Promise<void> {
    await this.availableCoursesSection.locator('app-course-card').first().locator('.course-card-link').click();
  }

  public getCourseCardInSection(section: Locator, title: string): Locator {
    return section.locator('app-course-card').filter({ hasText: title });
  }
}
