namespace API.DTOs.StudyQuest
{
    public sealed record AnswerDailyPuzzleResponse(
        bool AlreadyClaimed,
        bool Correct,
        int XpAwarded
    );
}
