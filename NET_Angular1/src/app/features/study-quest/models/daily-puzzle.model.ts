export interface DailyPuzzle {
  readonly questionText: string;
  readonly options: readonly string[];
  readonly alreadyClaimed: boolean;
}

export interface AnswerDailyPuzzleResponse {
  readonly alreadyClaimed: boolean;
  readonly correct: boolean;
  readonly xpAwarded: number;
}
