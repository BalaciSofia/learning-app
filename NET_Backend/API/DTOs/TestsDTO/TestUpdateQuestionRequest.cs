namespace API.DTOs.TestsDTO
{
    public record TestUpdateQuestionRequest(
        int Id,
        string Text,
        string Type,
        List<TestUpdateAnswerRequest> Answers
    );
}
