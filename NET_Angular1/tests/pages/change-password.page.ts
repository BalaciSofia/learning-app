import { Page, Locator } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class ChangePasswordPage {
  private readonly page: Page;
  public readonly currentPasswordInput: Locator;
  public readonly newPasswordInput: Locator;
  public readonly confirmPasswordInput: Locator;
  public readonly submitButton: Locator;
  public readonly messageArea: Locator;
  public readonly successToast: Locator;
  public readonly errorToast: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.currentPasswordInput = page.locator('#current-password');
    this.newPasswordInput = page.locator('#new-password');
    this.confirmPasswordInput = page.locator('#confirm-new-password');
    this.submitButton = page.locator('button[type="submit"]');
    this.messageArea = page.locator('#message-area');
    this.successToast = page.locator('.toast.success');
    this.errorToast = page.locator('.toast.error');
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.changePassword);
  }

  public async fillForm(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  public async submit(): Promise<void> {
    await this.submitButton.click();
  }

  public async fillAndSubmit(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    await this.fillForm(currentPassword, newPassword, confirmPassword);
    await this.submit();
  }
}
