import { Page, Locator, expect } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';
import { RegisterUserData } from '../fixtures/register-data.fixture';


export class RegisterPage {
  private readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly institutionIdInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly serverErrorMessage: Locator;

  private readonly togglePasswordBtn: Locator;
  private readonly validationErrorMessage: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#email');
    this.institutionIdInput = page.locator('#institutionId');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.locator('button[type="submit"]');

    this.togglePasswordBtn = page
      .locator('#password ~ button, #password + button, button:has(mat-icon), button[aria-label*="password"], .toggle-password')
      .or(page.locator('button[type="button"]').filter({ hasText: /show|hide|parol/i }));

    this.validationErrorMessage = page
      .locator('mat-error, .error-message, .invalid-feedback, .error, [class*="error"]')
      .or(page.getByText(/coincide|match|parol|email/i));

      this.serverErrorMessage = page.locator('div.auth.toast');
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.register);
  }

  public async registerUser(userData: RegisterUserData): Promise<void> {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.institutionIdInput.fill((userData.institutionId ?? 1).toString());
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);
    await this.submitButton.click();
  }

  public async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.emailInput.dispatchEvent('blur');
  }

  public async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  public async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.confirmPasswordInput.dispatchEvent('blur');
  }

  public async blurFirstNameField(): Promise<void> {
    await this.firstNameInput.click();
  }

  public async togglePasswordVisibility(): Promise<void> {
    await this.togglePasswordBtn.first().click();
  }

  public async expectPasswordInputType(expectedType: 'password' | 'text'): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', expectedType);
  }

  public async expectValidationErrorIsVisible(): Promise<void> {
    await expect(this.validationErrorMessage.first()).toBeVisible();
  }
  public async expectServerErrorMessageIsVisible(): Promise<void> {
    await expect(this.serverErrorMessage.first()).toBeVisible();
  }
}