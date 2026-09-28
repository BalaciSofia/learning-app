using Domain.Enums;

namespace Domain.Entities
{
    public class DuelInvitation
    {
        public int Id { get; set; }
        public int ChallengerId { get; set; }
        public User Challenger { get; set; } = null!;
        public int ChallengedId { get; set; }
        public User Challenged { get; set; } = null!;
        public int TestId { get; set; }
        public Test Test { get; set; } = null!;
        public string TestTitle { get; set; } = string.Empty;
        public InvitationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ChallengerScore { get; set; }
        public int? ChallengedScore { get; set; }
        public DuelResult? Result { get; set; }
    }
}
