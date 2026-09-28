namespace API.DTOs.QuestionDTO
{
    public record UpdateQuestionRequest(
        string Text,
        string Type
    );
}
