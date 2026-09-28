namespace API.DTOs.QuestionDTO
{
    public record AddQuestionRequest(
        string Text,
        string Type,
        List<AddAnswerRequest> Answers
    );
}
