namespace API.DTOs.DuelDTO
{
    public class DuelInvitationResponse
    {
        public int Id { get; set; }
        public int TestId { get; set; }
        public int ChallengerId { get; set; }
        public string ChallengerName { get; set; } = string.Empty;
        public int ChallengedId { get; set; }
        public string ChallengedName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? ChallengerScore { get; set; }
        public int? ChallengedScore { get; set; }
    }
}
