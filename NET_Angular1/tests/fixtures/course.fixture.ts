import { randomUUID } from 'crypto';

export interface CourseFixtureData {
  readonly title: string;
  readonly description: string;
  readonly subject: string;
  readonly metadata: string;
}

export function createCourseFixture(): CourseFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    title: `E2E Course ${uniqueId}`,
    description: 'Course created by a Playwright test.',
    subject: 'Automated Testing',
    metadata: 'Beginner',
  };
}

export const INVALID_COURSE_DATA = {
  titleTooLong: 'a'.repeat(201),
  descriptionTooLong: 'a'.repeat(2001),
  subjectTooLong: 'a'.repeat(101),
  metadataTooLong: 'a'.repeat(51),
};