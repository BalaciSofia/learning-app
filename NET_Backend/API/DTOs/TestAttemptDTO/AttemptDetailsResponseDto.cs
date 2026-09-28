namespace API.DTOs.TestAttemptDTO
{
    public class AttemptDetailsResponseDto
    {
        public int AttemptId { get; set; }
        public int TestId { get; set; }
        public int StudentId { get; set; }
        public string TestTitle { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public decimal MaxScore { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public List<AttemptFeedbackDto> Answers { get; set; } = new();
    }

    public class AttemptFeedbackDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public int AnswerId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public decimal PointsAwarded { get; set; }
        public string CorrectAnswerText { get; set; } = string.Empty;
    }
}