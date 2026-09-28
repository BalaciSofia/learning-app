export const MOCK_INVITATIONS = [
  {
    id: 101,
    testId: 1,
    challengerId: 2,
    challengerName: 'Alex Student',
    challengedId: 1,
    challengedName: 'Current User',
    testTitle: 'JavaScript Basics Quiz',
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_ACTIVE_DUELS = [
  {
    id: 102,
    testId: 2,
    challengerId: 1,
    challengerName: 'Current User',
    challengedId: 3,
    challengedName: 'Bob Smith',
    testTitle: 'Angular Fundamentals',
    status: 'Accepted',
    createdAt: new Date().toISOString(),
    challengerScore: null,
    challengedScore: null
  }
];

export const MOCK_HISTORY = [
  {
    duelId: 100,
    challengerName: 'Current User',
    challengedName: 'Charlie Brown',
    testTitle: 'TypeScript Essentials',
    challengerCorrectAnswers: 5,
    challengedCorrectAnswers: 3,
    winnerId: 1,
    winnerName: 'Current User',
    isDraw: false,
    completedAt: new Date().toISOString()
  }
];

export const MOCK_DUEL_TEST_QUESTIONS = {
  id: 2,
  title: 'Angular Fundamentals',
  questions: [
    {
      id: 1,
      text: 'What is Angular?',
      type: 'single',
      answers: [
        { id: 10, text: 'A framework' },
        { id: 11, text: 'A database' }
      ]
    }
  ]
};
