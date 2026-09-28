export interface TestSummary {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly isRetakeAllowed: boolean;
  readonly isPublished: boolean;
  readonly creatorId: number;
  readonly questionCount: number;
  readonly hasAttempted: boolean;
}
