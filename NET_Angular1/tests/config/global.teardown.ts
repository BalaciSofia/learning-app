import { test as teardown } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { AdminPage } from '../pages';

const authDir = path.resolve(__dirname, '../.auth');
const usersFile = path.join(authDir, 'test-users.json');
const adminStateFile = path.join(authDir, 'admin.json');

teardown('Global Teardown - Delete created test users via Admin panel', async ({ browser }) => {
  if (!fs.existsSync(usersFile) || !fs.existsSync(adminStateFile)) {
    console.log('No user data or admin session found for teardown.');
    return;
  }

  const { studentEmail, teacherEmail, userEmail } = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

  const context = await browser.newContext({ storageState: adminStateFile });
  const page = await context.newPage();
  const adminPage = new AdminPage(page);

  await adminPage.goto();

  if (studentEmail) {
    await adminPage.deleteUser(studentEmail);
  }

  if (teacherEmail) {
    await adminPage.deleteUser(teacherEmail);
  }

  if (userEmail) {
    await adminPage.deleteUser(userEmail);
  }

  await context.close();
});
