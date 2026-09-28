import { test as base, expect } from '@playwright/test';
import * as path from 'path';
import { ApiAddresses } from '../api/api-addresses';
import { createBasicUserFixture, BasicUserFixture } from '../utils/test-data';
import { AdminPage } from '../pages';

interface RegisteredBasicUser extends BasicUserFixture {
  id: number;
}

interface AdminRoleFixtures {
  adminPage: AdminPage;
  adminToken: string;
  basicUser: RegisteredBasicUser;
}

export const test = base.extend<AdminRoleFixtures>({
  storageState: path.resolve(__dirname, '../.auth/admin.json'),

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  adminToken: async ({ page }, use) => {
    await page.goto(ApiAddresses.baseUrl + ApiAddresses.dashboard);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!token) {
      throw new Error('adminToken fixture could not read accessToken from localStorage. Is .auth/admin.json valid?');
    }
    await use(token);
  },

  basicUser: async ({ request, adminToken }, use) => {
    const data = createBasicUserFixture();

    const registerResponse = await request.post(`${ApiAddresses.apiBaseUrl}${ApiAddresses.apiRegister}`, {
      data: { ...data, confirmPassword: data.password },
    });
    expect(registerResponse.status(), 'basicUser fixture setup: registration should succeed').toBe(201);
    const { id } = await registerResponse.json();

    await use({ ...data, id });

    const deleteResponse = await request.delete(`${ApiAddresses.apiBaseUrl}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteResponse.ok(), 'basicUser fixture teardown: cleanup delete should succeed').toBeTruthy();
  },
});

export { expect };
