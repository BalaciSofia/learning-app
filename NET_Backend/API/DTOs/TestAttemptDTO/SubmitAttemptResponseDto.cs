namespace API.DTOs.TestAttemptDTO
{
    public class SubmitAttemptResponseDto
    {
        public int AttemptId { get; set; }
        public int QuestionId { get; set; }
        public int AnswerId { get; set; }
        public string Message { get; set; } = "Answer saved.";
    }
}