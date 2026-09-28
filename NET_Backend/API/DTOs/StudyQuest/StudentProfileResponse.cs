namespace API.DTOs.StudyQuest
{
    public sealed record StudentProfileResponse(
        string Name,
        string Initials,
        int Xp,
        int Level,
        string Rank,
        int Streak,
        int QuestionsToday,
        int CorrectToday,
        int BattlesWon,
        IReadOnlyList<string> Medals,
        int DailyQuestProgress,
        DateOnly? DailyPuzzleClaimedDate
    );
}
