import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  private readonly page: Page;
  private readonly profileButton: Locator;
  private readonly profileName: Locator;
  private readonly profileEmail: Locator;
  private readonly closeButton: Locator;
  private readonly profilePanel: Locator;
  private readonly changePasswordLink: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly confirmDialogButton: Locator;
  private readonly cancelDialogButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileButton = page.locator(
      'button.nav-item.nav-item-button',
      { hasText: 'My Profile' },
    );
    this.profileName = page.locator('p.profile-name');
    this.profileEmail = page.locator('p.profile-email');
    this.closeButton = page.locator(
      'aside.profile-panel button.icon-button',
      {
        has: page.locator(
          'span.material-symbols-rounded',
          { hasText: 'close' },
        ),
      },
    );
    this.profilePanel = page.locator('aside.profile-panel');
    this.changePasswordLink = page.locator(
      'a.primary-button',
      { hasText: 'Change password' },
    );
    this.deleteAccountButton = page.locator(
      'button.danger-button',
      { hasText: 'Delete account' },
    );

    this.confirmDialogButton = page.locator(
      'app-confirm-dialog button',
      { hasText: 'Delete Account' },
    );
    this.cancelDialogButton = page.locator(
      'app-confirm-dialog button',
      { hasText: 'Cancel' },
    );
  }

  public async openProfileDrawer(): Promise<void> {
    await this.profileButton.click();
    await expect(this.profileName).toBeVisible();
  }

  public async closeProfileDrawer(): Promise<void> {
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.click();
    await expect(this.profilePanel).not.toHaveClass(/open/);
  }

  public async clickChangePassword(): Promise<void> {
    await expect(this.changePasswordLink).toBeVisible();
    await this.changePasswordLink.click();
  }

  public async clickDeleteAccount(): Promise<void> {
    await expect(this.deleteAccountButton).toBeVisible();
    await this.deleteAccountButton.click();
  }

  public async confirmAccountDeletion(): Promise<void> {
    await expect(this.confirmDialogButton).toBeVisible();
    await this.confirmDialogButton.click();
  }

  public async cancelAccountDeletion(): Promise<void> {
    await expect(this.cancelDialogButton).toBeVisible();
    await this.cancelDialogButton.click();
  }

  public async verifyProfileName(expectedName: string): Promise<void> {
    await expect(this.profileName).toHaveText(expectedName);
  }

  public async verifyProfileEmail(expectedEmail: string): Promise<void> {
    await expect(this.profileEmail).toHaveText(expectedEmail);
  }
}