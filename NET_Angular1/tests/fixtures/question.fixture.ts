import { randomUUID } from 'crypto';

export const ATTEMPTED_EDIT_TEXT = 'This text should never be saved';

export interface AnswerFixtureData {
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface QuestionFixtureData {
  readonly text: string;
  readonly type: 'single' | 'multiple';
  readonly answers: AnswerFixtureData[];
}

export function createSingleChoiceQuestionFixture(): QuestionFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    text: `E2E single-choice question ${uniqueId}?`,
    type: 'single',
    answers: [
      { text: `Correct answer ${uniqueId}`, isCorrect: true },
      { text: `Wrong answer ${uniqueId}`, isCorrect: false },
    ],
  };
}

export function createMultipleChoiceQuestionFixture(): QuestionFixtureData {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    text: `E2E multiple-choice question ${uniqueId}?`,
    type: 'multiple',
    answers: [
      { text: `Correct answer A ${uniqueId}`, isCorrect: true },
      { text: `Correct answer B ${uniqueId}`, isCorrect: true },
      { text: `Wrong answer ${uniqueId}`, isCorrect: false },
    ],
  };
}
