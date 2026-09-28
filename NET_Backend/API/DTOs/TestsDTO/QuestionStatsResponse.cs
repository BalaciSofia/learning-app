namespace API.DTOs.TestsDTO
{
    public record QuestionStatsResponse(
        int QuestionId,
        string Text,
        decimal CorrectRate
    );
}
