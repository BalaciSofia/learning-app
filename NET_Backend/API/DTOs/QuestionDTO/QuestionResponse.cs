namespace API.DTOs.QuestionDTO
{
    public record QuestionResponse(
        int Id,
        string Text,
        string Type,
        List<AnswerResponse> Answers
    );
}
