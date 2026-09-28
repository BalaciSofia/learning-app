import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage, RegisterPage, AdminPage } from '../pages';
import { ADMIN_CREDENTIALS } from '../utils/credentials';
import { StudentUser, TeacherUser, BasicUser } from '../fixtures/user.fixtures';

const authDir = path.resolve(__dirname, '../.auth');

setup('Global Setup - Register users, assign roles via Admin, and save storage states', async ({ browser }) => {
  // Ensure .auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Generate dynamic test user accounts
  const runId = Date.now();
  const studentEmail = `student_${runId}@example.com`;
  const teacherEmail = `teacher_${runId}@example.com`;
  const userEmail = `user_${runId}@example.com`;
  const commonPassword = 'TestPassword123!';

  // Helper to open a fresh browser context & page
  const createCleanSession = async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    return { context, page };
  };

  // 1. Register Student, Teacher, and Basic User
  {
    const { context, page } = await createCleanSession();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.registerUser({
      firstName: StudentUser.firstName,
      lastName: StudentUser.lastName,
      email: studentEmail,
      password: commonPassword,
      institutionId: 1
    });
    await expect(page).toHaveURL(/.*login/);

    await registerPage.goto();
    await registerPage.registerUser({
      firstName: TeacherUser.firstName,
      lastName: TeacherUser.lastName,
      email: teacherEmail,
      password: commonPassword,
      institutionId: 1
    });
    await expect(page).toHaveURL(/.*login/);

    await registerPage.goto();
    await registerPage.registerUser({
      firstName: BasicUser.firstName,
      lastName: BasicUser.lastName,
      email: userEmail,
      password: commonPassword,
      institutionId: 1
    });
    await expect(page).toHaveURL(/.*login/);

    await context.close();
  }

  // 2. Login as Admin & Update roles in Admin panel
  {
    const { context, page } = await createCleanSession();
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    await loginPage.goto();
    await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    await expect(page).toHaveURL(/.*dashboard/);
    await context.storageState({ path: path.join(authDir, 'admin.json') });

    await adminPage.goto();
    await adminPage.changeUserRole(studentEmail, 'Student');
    await adminPage.changeUserRole(teacherEmail, 'Teacher');

    await context.close();
  }

  // Save generated emails for global teardown and tests
  fs.writeFileSync(
    path.join(authDir, 'test-users.json'),
    JSON.stringify({ studentEmail, teacherEmail, userEmail, commonPassword })
  );

  fs.writeFileSync(
    path.join(authDir, 'not-login-state.json'),
    JSON.stringify({
      cookies: [],
      origins: []
    })
  );

  // 3. Login as Student & save storage state
  {
    const { context, page } = await createCleanSession();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(studentEmail, commonPassword);
    await expect(page).toHaveURL(/.*dashboard/);
    await context.storageState({ path: path.join(authDir, 'student.json') });

    await context.close();
  }

  // 4. Login as Teacher & save storage state
  {
    const { context, page } = await createCleanSession();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(teacherEmail, commonPassword);
    await expect(page).toHaveURL(/.*dashboard/);
    await context.storageState({ path: path.join(authDir, 'teacher.json') });

    await context.close();
  }

  // 5. Login as Basic User & save storage state
  {
    const { context, page } = await createCleanSession();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(userEmail, commonPassword);
    await expect(page).toHaveURL(/.*dashboard/);
    await context.storageState({ path: path.join(authDir, 'user.json') });

    await context.close();
  }
});
