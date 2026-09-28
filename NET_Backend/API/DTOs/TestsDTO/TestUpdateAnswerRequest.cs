namespace API.DTOs.TestsDTO
{
    public record TestUpdateAnswerRequest(
        int Id,
        string Text,
        bool IsCorrect
    );
}
