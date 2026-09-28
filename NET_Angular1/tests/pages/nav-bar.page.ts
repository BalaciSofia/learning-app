import { Page, Locator, expect } from '@playwright/test';

export class NavbarPage {
  private readonly page: Page;
  private readonly homeLink: Locator;
  private readonly testsLink: Locator;
  private readonly coursesLink: Locator;
  private readonly myProfileButton: Locator;
  private readonly logoutButton: Locator;
  private readonly userProfileWrapper: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.locator('a.nav-item', { hasText: 'Home' });
    this.testsLink = page.locator('a.nav-item', { hasText: 'Tests' });
    this.coursesLink = page.locator('a.nav-item', { hasText: 'Courses' });
    this.myProfileButton = page.locator('button.nav-item.nav-item-button', { hasText: 'My Profile' });
    this.logoutButton = page.locator('button.logout-btn');
    this.userProfileWrapper = page.locator('div.user-profile-wrapper');
  }

  public async clickHome(): Promise<void> {
    await expect(this.homeLink).toBeVisible();
    await this.homeLink.click();
  }

  public async clickTests(): Promise<void> {
    await expect(this.testsLink).toBeVisible();
    await this.testsLink.click();
  }

  public async clickCourses(): Promise<void> {
    await expect(this.coursesLink).toBeVisible();
    await this.coursesLink.click();
  }

  public async clickMyProfile(): Promise<void> {
    await expect(this.myProfileButton).toBeVisible();
    await this.myProfileButton.click();
  }

  public async clickLogout(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }

  public async verifyUserProfileVisible(): Promise<void> {
    await expect(this.userProfileWrapper).toBeVisible();
  }
}