export interface StartAttemptResponse {
  readonly attemptId: number;
  readonly testId: number;
  readonly studentId: number;
  readonly testTitle: string;
  readonly startedAt: string;
}

export interface SubmitAnswerResponse {
  readonly attemptId: number;
  readonly questionId: number;
  readonly answerId: number;
  readonly message: string;
}

export interface AttemptSummaryResponse {
  readonly attemptId: number;
  readonly testId: number;
  readonly studentId: number;
  readonly score: number;
  readonly maxScore: number;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly startedAt: string;
  readonly submittedAt: string | null;
}

export interface AttemptAnswerResponse {
    readonly questionId: number;
    readonly questionText: string;
    readonly answerId: number;
    readonly answerText: string;
    readonly isCorrect: boolean;
    readonly correctAnswerText: string | null;
    readonly pointsAwarded: number;
}

export interface AttemptDetailsResponse {
    readonly attemptId: number;
    readonly testId: number;
    readonly studentId: number;
    readonly testTitle: string;
    readonly score: number;
    readonly maxScore: number;
    readonly correctAnswers: number;
    readonly totalQuestions: number;
    readonly startedAt?: string;
    readonly submittedAt?: string | null;
    readonly answers: AttemptAnswerResponse[];
}