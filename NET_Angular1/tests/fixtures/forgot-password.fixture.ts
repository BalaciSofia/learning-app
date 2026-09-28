/// <reference types="node" />

import { expect, test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface StoredTestUsers {
  readonly userEmail: string;
}

export interface ForgotPasswordTestData {
  readonly registeredEmail: string;
  readonly unregisteredEmail: string;
  readonly invalidEmail: string;
  readonly processingEmail: string;
  readonly keyboardEmail: string;
  readonly navigationEmail: string;
  readonly successMessage: string;
}

interface ForgotPasswordFixtures {
  readonly forgotPasswordData: ForgotPasswordTestData;
}

export const test = base.extend<ForgotPasswordFixtures>({
  forgotPasswordData: async ({}, use): Promise<void> => {
    const usersFile = path.resolve(__dirname, '../.auth/test-users.json');

    if (!fs.existsSync(usersFile)) {
      throw new Error('The test users file was not created by global setup.');
    }

    const testUsers = JSON.parse(
      fs.readFileSync(usersFile, 'utf-8')
    ) as StoredTestUsers;

    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await use({
      registeredEmail: testUsers.userEmail,
      unregisteredEmail: `unregistered_${uniqueId}@example.com`,
      invalidEmail: 'invalid-email',
      processingEmail: `processing_${uniqueId}@example.com`,
      keyboardEmail: `keyboard_${uniqueId}@example.com`,
      navigationEmail: `navigation_${uniqueId}@example.com`,
      successMessage:
        'If an account with this email exists, a password reset link has been sent.'
    });
  }
});

export { expect };