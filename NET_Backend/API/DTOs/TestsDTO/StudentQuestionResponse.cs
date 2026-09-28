namespace API.DTOs.TestsDTO
{
    public record StudentQuestionResponse(
        int Id,
        string Text,
        string Type,
        List<StudentAnswerResponse> Answers
    );
}
