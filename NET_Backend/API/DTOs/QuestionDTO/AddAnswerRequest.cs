namespace API.DTOs.QuestionDTO
{
    public record AddAnswerRequest
    (
        string Text,
        bool IsCorrect
    );
}
