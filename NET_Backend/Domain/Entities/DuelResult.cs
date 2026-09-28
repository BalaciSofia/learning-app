namespace Domain.Entities
{
    public class DuelResult
    {
        public int Id { get; set; }
        public int DuelInvitationId { get; set; }
        public DuelInvitation DuelInvitation { get; set; } = null!;
        public int? WinnerId { get; set; }
        public User? Winner { get; set; }
        public int ChallengerCorrectAnswers { get; set; }
        public int ChallengedCorrectAnswers { get; set; }
        public bool IsDraw { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
