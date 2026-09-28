export interface StudentProfile {
  readonly name: string;
  readonly initials: string;
  readonly xp: number;
  readonly level: number;
  readonly rank: string;
  readonly streak: number;
  readonly questionsToday: number;
  readonly correctToday: number;
  readonly battlesWon: number;
  readonly medals: readonly string[];
  readonly dailyQuestProgress: number;
  readonly dailyPuzzleClaimedDate: string | null;
}
