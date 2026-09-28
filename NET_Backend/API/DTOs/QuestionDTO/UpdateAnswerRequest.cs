namespace API.DTOs.QuestionDTO
{
    public record UpdateAnswerRequest(
        string Text, 
        bool IsCorrect
    );
}
