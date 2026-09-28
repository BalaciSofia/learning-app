namespace API.DTOs.TestsDTO
{
    public record CreateTestRequest(
        string Title,
        string? Description,
        bool IsRetakeAllowed);
}
