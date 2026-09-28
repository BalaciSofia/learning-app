/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Timeout per test */
  timeout: 30_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Raise the assertion timeout so slow backend responses don't cause
     not.toHaveText / not.toBeVisible to time out (default is only 5 s).
     Setup/teardown can face a busy admin panel with accumulated DB users,
     so this needs to be well under the 300 s project timeout set below. */
  expect: { timeout: 90000 },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Timeout for each action (click, fill, etc.) */
    actionTimeout: 10_000,
    /* Timeout for page navigations */
    navigationTimeout: 15_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testDir: './config',
      testMatch: /global\.setup\.ts/,
      // Setup makes several sequential API calls through the admin panel which can
      // be slow when the DB has accumulated leftover users. Give it enough runway.
      timeout: 120_000,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testDir: './config',
      testMatch: /global\.teardown\.ts/,
      timeout: 120_000,
    },
    {
      // All spec files EXCEPT the change-password suite run here in parallel.
      name: 'chromium',
      testDir: './tests',
      use: {
        headless: true,
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

  ],
});
