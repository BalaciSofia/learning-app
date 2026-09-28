namespace Domain.Entities
{
    public class TestAttemptAnswer
    {
        public int Id { get; set; }
        public int TestAttemptId { get; set; }
        public TestAttempt TestAttempt { get; set; }
        public int QuestionId { get; set; }
        public Question Question { get; set; }
        public int AnswerId { get; set; }
        public Answer Answer { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public decimal PointsAwarded { get; set; }
    }
}