namespace API.DTOs.Distractor
{
    public record GenerateDistractorsResponse(
        IReadOnlyList<string> Distractors);
}