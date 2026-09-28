namespace API.DTOs.TestsDTO
{
    public record TestStatsResponse(
        int AttemptCount,
        decimal? AverageScore,
        decimal? HighScore,
        decimal? LowScore,
        List<QuestionStatsResponse> QuestionBreakdown
    );
}
