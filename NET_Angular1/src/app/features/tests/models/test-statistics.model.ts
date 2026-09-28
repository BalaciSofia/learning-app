export interface QuestionStatistics {
    readonly questionId: number;
    readonly text: string;
    readonly correctRate: number;
}

export interface TestStatistics {
    readonly attemptCount: number;
    readonly averageScore: number | null;
    readonly highScore: number | null;
    readonly lowScore: number | null;
    readonly questionBreakdown: QuestionStatistics[];
}