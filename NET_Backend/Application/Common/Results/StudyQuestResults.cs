namespace Application.Common.Results
{
    public sealed record DailyPuzzleResult(
        string QuestionText,
        IReadOnlyList<string> Options,
        bool AlreadyClaimed
    );

    public sealed record AnswerDailyPuzzleResult(
        bool AlreadyClaimed,
        bool Correct,
        int XpAwarded
    );

    public sealed record ShareProgressResult(
        string Text,
        string? Url
    );
}
