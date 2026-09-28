import { Page, Locator, Response, expect } from '@playwright/test';
import { ApiAddresses } from '../api/api-addresses';

export class AdminPage {
  private readonly page: Page;
  private readonly basicUsersTab: Locator;
  private readonly allUsersTab: Locator;
  private readonly confirmChangeRoleBtn: Locator;
  private readonly cancelChangeRoleBtn: Locator;
  private readonly confirmDeleteBtn: Locator;
  private readonly cancelDeleteBtn: Locator;
  private readonly userTableRows: Locator;
  private readonly roleSelectSelector: string;
  private readonly saveBtnSelector: string;
  private readonly deleteBtnSelector: string;

  public constructor(page: Page) {
    this.page = page;
    this.basicUsersTab = page.locator('button.tab-button', { hasText: 'Basic Users' });
    this.allUsersTab = page.locator('button.tab-button', { hasText: 'All Users' });
    this.confirmChangeRoleBtn = page.locator('app-confirm-dialog button', { hasText: 'Change role' });
    this.cancelChangeRoleBtn = page.locator('app-confirm-dialog button', { hasText: 'Cancel' });
    this.confirmDeleteBtn = page.locator('app-confirm-dialog button', { hasText: 'Delete account' });
    this.cancelDeleteBtn = page.locator('app-confirm-dialog button', { hasText: 'Cancel' });
    this.userTableRows = page.locator('table.user-table tbody tr');
    this.roleSelectSelector = 'select.role-select';
    this.saveBtnSelector = 'button.save-button';
    this.deleteBtnSelector = 'button.delete-button';
  }

  private getUserRow(email: string): Locator {
    return this.userTableRows.filter({ hasText: email });
  }

  public async goto(): Promise<void> {
    await this.page.goto(ApiAddresses.baseUrl + ApiAddresses.admin);
  }

  /** Selects a role in the Basic Users tab without saving. */
  public async selectRole(email: string, targetRole: 'Teacher' | 'Student'): Promise<void> {
    await this.basicUsersTab.click();
    const row = this.getUserRow(email);
    await expect(row).toBeVisible();
    await row.locator(this.roleSelectSelector).selectOption(targetRole);
  }

  /** Clicks Save for a row already showing a selected role; does not confirm the dialog. */
  public async clickSave(email: string): Promise<void> {
    await this.getUserRow(email).locator(this.saveBtnSelector).click();
  }

  /** Confirms the pending role change in the dialog and returns the PATCH response. */
  public async confirmPendingRoleChange(): Promise<Response> {
    const roleChangeResponse = this.page.waitForResponse(
      res =>
        res.url().includes('/api/admin/users/') &&
        res.url().includes('/role') &&
        res.request().method() === 'PATCH'
    );
    await this.confirmChangeRoleBtn.click();
    return roleChangeResponse;
  }

  /** Cancels the pending role change dialog without sending any request. */
  public async cancelPendingRoleChange(): Promise<void> {
    await this.cancelChangeRoleBtn.click();
  }

  public async isUserInBasicUsers(email: string): Promise<boolean> {
    await this.basicUsersTab.click();
    return (await this.getUserRow(email).count()) > 0;
  }

  public async getUserRoleBadgeText(email: string): Promise<string> {
    await this.allUsersTab.click();
    const text = await this.getUserRow(email).locator('.role-badge').innerText();
    return text.trim();
  }

  public async getRoleOptionLabels(email: string): Promise<string[]> {
    await this.basicUsersTab.click();
    const row = this.getUserRow(email);
    await expect(row).toBeVisible();
    return row.locator(`${this.roleSelectSelector} option`).allTextContents();
  }

  public async changeUserRole(email: string, targetRole: 'Teacher' | 'Student'): Promise<void> {
    await this.basicUsersTab.click();

    const row = this.getUserRow(email);
    await expect(row).toBeVisible();

    const roleSelect = row.locator(this.roleSelectSelector);
    await roleSelect.selectOption(targetRole);

    const saveBtn = row.locator(this.saveBtnSelector);

    const roleChangeResponse = this.page.waitForResponse(
      res =>
        res.url().includes('/api/admin/users/') &&
        res.url().includes('/role') &&
        res.request().method() === 'PATCH'
    );

    await saveBtn.click();
    await this.confirmChangeRoleBtn.click();
    await roleChangeResponse;
    await this.page.waitForLoadState('networkidle');
  }

  public async deleteUser(email: string): Promise<void> {
    await this.allUsersTab.click();

    const row = this.getUserRow(email);
    await expect(row).toBeVisible();

    const deleteBtn = row.locator(this.deleteBtnSelector);

    const deleteResponse = this.page.waitForResponse(
      res =>
        /\/api\/users\/\d+/.test(res.url()) &&
        res.request().method() === 'DELETE'
    );

    await deleteBtn.click();
    await this.confirmDeleteBtn.click();
    await deleteResponse;
  }

  public async clickDeleteButton(email: string): Promise<void> {
    await this.allUsersTab.click();
    const row = this.getUserRow(email);
    await expect(row).toBeVisible();
    await row.locator(this.deleteBtnSelector).click();
  }

  public async confirmPendingUserDelete(): Promise<void> {
    await this.confirmDeleteBtn.click();
  }

  public async waitForDeleteSuccessToast(firstName: string, lastName: string): Promise<void> {
    await expect(this.page.getByText(`Account for ${firstName} ${lastName} has been deleted.`)).toBeVisible();
  }

  public async cancelPendingUserDelete(): Promise<void> {
    await this.cancelDeleteBtn.click();
  }

  public async isUserInAllUsers(email: string): Promise<boolean> {
    await this.allUsersTab.click();
    return (await this.getUserRow(email).count()) > 0;
  }
}
