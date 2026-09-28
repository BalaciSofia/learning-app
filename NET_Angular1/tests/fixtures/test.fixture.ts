import { randomUUID } from 'crypto';

export interface TestFixtureData {
  readonly title: string;
  readonly description: string;
  readonly isRetakeAllowed: boolean;
}

export function createTestFixture(): TestFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    title: `E2E Test ${uniqueId}`,
    description: 'Test created by an automated Playwright test.',
    isRetakeAllowed: true,
  };
}

export const INVALID_TEST_DATA = {
  titleTooLong: 'a'.repeat(201),
  descriptionTooLong: 'a'.repeat(2001),
};