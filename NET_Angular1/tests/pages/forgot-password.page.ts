import { Locator, Page } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class ForgotPasswordPage {
  private readonly emailInput: Locator;
  private readonly submitButtonLocator: Locator;
  private readonly successHeadingLocator: Locator;
  private readonly invalidEmailErrorLocator: Locator;
  private readonly requiredEmailErrorLocator: Locator;
  private readonly backToSignInLink: Locator;

  public constructor(private readonly page: Page) {
    this.emailInput = page.locator('#email');
    this.submitButtonLocator = page.locator('button[type="submit"]');
    this.successHeadingLocator = page.getByRole('heading', { name: 'Check your inbox' });
    this.invalidEmailErrorLocator = page.getByText('Enter a valid email address.');
    this.requiredEmailErrorLocator = page.getByText('Email is required.');
    this.backToSignInLink = page.getByRole('link', { name: 'Back to sign in' });
  }

  public get submitButton(): Locator {
    return this.submitButtonLocator;
  }

  public get successHeading(): Locator {
    return this.successHeadingLocator;
  }

  public get invalidEmailError(): Locator {
    return this.invalidEmailErrorLocator;
  }

  public get requiredEmailError(): Locator {
    return this.requiredEmailErrorLocator;
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.forgotPassword);
  }

  public async requestPasswordReset(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButtonLocator.click();
  }

  public async submitEmptyForm(): Promise<void> {
    await this.submitButtonLocator.click();
  }

  public async submitWithEnter(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.emailInput.press('Enter');
  }

  public async navigateBackToLogin(): Promise<void> {
    await this.backToSignInLink.click();
  }
}