namespace API.DTOs.QuestionDTO
{
    public record AnswerResponse(
        int Id,
        string Text,
        bool IsCorrect
    );
}
