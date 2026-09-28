namespace API.DTOs.DuelDTO
{
    public class DuelResultResponse
    {
        public int DuelId { get; set; }
        public int? WinnerId { get; set; }
        public string? WinnerName { get; set; }
        public int ChallengerCorrectAnswers { get; set; }
        public int ChallengedCorrectAnswers { get; set; }
        public bool IsDraw { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
