import { randomUUID } from 'crypto';

export interface UnitFixtureData {
  readonly title: string;
}

export function createUnitFixture(): UnitFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    title: `E2E Unit ${uniqueId}`,
  };
}

export const UNIT_TITLE_REQUIRED_ERROR = 'Title is required';
