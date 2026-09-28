import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';
import { BASIC_UNASSIGNED_ROLE_MESSAGE } from '../fixtures/dashboard.fixture';

export class DashboardPage {
  private readonly page: Page;
  private readonly quickLinks: Locator;
  private readonly heroTitle: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.quickLinks = page.locator('a.quick-link');
    this.heroTitle = page.locator('h1.hero-title');
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.dashboard);
  }

  public getQuickLink(title: string): Locator {
    return this.quickLinks.filter({ hasText: title });
  }

  public getAllQuickLinks(): Locator {
    return this.quickLinks;
  }

  public getHeroTitle(): Locator {
    return this.heroTitle;
  }

  public getUnassignedRoleMessage(): Locator {
    return this.page.getByText(BASIC_UNASSIGNED_ROLE_MESSAGE, { exact: false });
  }
}
