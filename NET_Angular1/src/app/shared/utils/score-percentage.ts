export function calculateScorePercentage(score: number, maxScore: number): number {
    if (maxScore <= 0) {
        return 0;
    }

    return Math.round((score / maxScore) * 100);
}