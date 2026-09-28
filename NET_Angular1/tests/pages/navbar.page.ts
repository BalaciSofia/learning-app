import { Locator, Page } from '@playwright/test';

export class NavbarPage {
  private readonly nav: Locator;
  private readonly userName: Locator;
  private readonly roleBadge: Locator;
  private readonly profilePanel: Locator;
  private readonly testsLink: Locator;
  private readonly coursesLink: Locator;

  public constructor(page: Page) {
    this.nav = page.locator('nav.app-nav');
    this.userName = page.locator('.username-text');
    this.roleBadge = page.locator('.user-profile-wrapper .role-badge');
    this.profilePanel = page.locator('aside.profile-panel');

    this.testsLink = page.getByRole(
      'link',
      {
        name: 'Tests',
        exact: true,
      },
    );

    this.coursesLink = page.getByRole(
      'link',
      {
        name: 'Courses',
        exact: true,
      },
    );
  }

  public getNavItem(label: string): Locator {
    return this.nav.locator('.nav-item', { hasText: label });
  }

  public getAllNavItems(): Locator {
    return this.nav.locator('.nav-item');
  }

  public async clickNavItem(label: string): Promise<void> {
    await this.getNavItem(label).click();
  }

  public getUserName(): Locator {
    return this.userName;
  }

  public getRoleBadge(): Locator {
    return this.roleBadge;
  }

  public getProfilePanel(): Locator {
    return this.profilePanel;
  }

  public async openTests(): Promise<void> {
    await this.testsLink.click();
  }

  public async openCourses(): Promise<void> {
    await this.coursesLink.click();
  }
}
