namespace Domain.Entities
{
    public class TestAttempt
    {
        public int Id { get; set; }
        public int TestId { get; set; }
        public Test Test { get; set; }
        public string TestTitle { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public User Student { get; set; }
        public decimal Score { get; set; }
        public decimal MaxScore { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public bool IsSubmitted { get; set; }
        public ICollection<TestAttemptAnswer> Answers { get; set; } = new List<TestAttemptAnswer>();
    }
}