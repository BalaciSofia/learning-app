import { randomUUID } from 'crypto';

export interface LessonFixtureData {
  readonly title: string;
  readonly description: string;
  readonly duration: number;
  readonly type: string;
  readonly videoUrl?: string;
}

export function createLessonFixture(): LessonFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    title: `E2E Lesson ${uniqueId}`,
    description: 'Lesson created by an automated Playwright test.',
    duration: 15,
    type: 'Video',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  };
}
