namespace API.DTOs.TestsDTO
{
    public record UpdateTestRequest(
        string Title,
        string? Description,
        bool IsRetakeAllowed,
        List<TestUpdateQuestionRequest> Questions
    );
}
