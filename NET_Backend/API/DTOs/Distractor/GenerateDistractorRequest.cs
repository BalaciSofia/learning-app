namespace API.DTOs.Distractor
{
    public record GenerateDistractorsRequest(
        string QuestionText,
        string CorrectAnswer);
}