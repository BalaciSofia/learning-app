namespace API.DTOs.StudyQuest
{
    public sealed record DailyPuzzleResponse(
        string QuestionText,
        IReadOnlyList<string> Options,
        bool AlreadyClaimed
    );
}
