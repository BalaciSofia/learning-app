namespace API.DTOs.TestAttemptDTO
{
    public class StartAttemptResponseDto
    {
        public int AttemptId { get; set; }
        public int TestId { get; set; }
        public int StudentId { get; set; }
        public string TestTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
    }
}