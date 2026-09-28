namespace Domain.Entities
{
    public class DailyPuzzle
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public DateOnly PuzzleDate { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Options { get; set; } = "[]";
        public int CorrectAnswerIndex { get; set; }
    }
}
