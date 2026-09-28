namespace API.DTOs.DuelDTO
{
    public class DuelHistoryResponse
    {
        public int DuelId { get; set; }
        public string ChallengerName { get; set; } = string.Empty;
        public string ChallengedName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public int ChallengerCorrectAnswers { get; set; }
        public int ChallengedCorrectAnswers { get; set; }
        public int? WinnerId { get; set; }
        public string? WinnerName { get; set; }
        public bool IsDraw { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
