export interface DailyPuzzleFixture {
  readonly questionText: string;
  readonly options: readonly string[];
  readonly alreadyClaimed: boolean;
}

export interface AnswerDailyPuzzleFixture {
  readonly alreadyClaimed: boolean;
  readonly correct: boolean;
  readonly xpAwarded: number;
}

export const MOCK_DAILY_PUZZLE: DailyPuzzleFixture = {
  questionText: 'What is the powerhouse of the cell?',
  options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
  alreadyClaimed: false,
};

export const MOCK_CORRECT_ANSWER: AnswerDailyPuzzleFixture = {
  alreadyClaimed: false,
  correct: true,
  xpAwarded: 50,
};

export const MOCK_INCORRECT_ANSWER: AnswerDailyPuzzleFixture = {
  alreadyClaimed: false,
  correct: false,
  xpAwarded: 0,
};

export const MOCK_ALREADY_CLAIMED_ANSWER: AnswerDailyPuzzleFixture = {
  alreadyClaimed: true,
  correct: false,
  xpAwarded: 0,
};
