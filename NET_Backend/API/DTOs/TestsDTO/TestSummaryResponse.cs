namespace API.DTOs.TestsDTO
{
    public record TestSummaryResponse(
        int Id,
        string Title,
        string? Description,
        bool IsRetakeAllowed,
        bool IsPublished,
        int CreatorId,
        int QuestionCount
    )
    {
        public bool HasAttempted { get; init; }
    }
}
