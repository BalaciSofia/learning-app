namespace API.DTOs.TestAttemptDTO
{
    public class AttemptSummaryResponseDto
    {
        public int AttemptId { get; set; }
        public int TestId { get; set; }
        public int StudentId { get; set; }
        public decimal Score { get; set; }
        public decimal MaxScore { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }

    }
}