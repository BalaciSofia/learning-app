import { expect, Locator, Page } from '@playwright/test';

export class LogoutPage {
  private readonly logoutButton: Locator;

  public constructor(page: Page) {
    this.logoutButton = page.locator('button.logout-btn');
  }

  public async clickLogout(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }
}
