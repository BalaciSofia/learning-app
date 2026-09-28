namespace API.DTOs.TestsDTO
{
    public record StudentTestResponse(
        int Id,
        string Title,
        string? Description,
        bool IsRetakeAllowed,
        List<StudentQuestionResponse> Questions
    );
}
