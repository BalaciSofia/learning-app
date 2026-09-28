using API.DTOs.QuestionDTO;

namespace API.DTOs.TestsDTO
{
    public record CreateTestResponse(
        int Id,
        string Title,
        string? Description,
        bool IsRetakeAllowed,
        bool IsPublished,
        int CreatorId,
        List<QuestionResponse> Questions
    );
}
