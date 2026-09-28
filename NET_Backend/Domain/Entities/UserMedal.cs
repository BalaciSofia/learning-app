using Domain.Enums;

namespace Domain.Entities
{
    public class UserMedal
    {
        public int Id { get; set; }
        public int StudentProfileId { get; set; }
        public StudentProfile StudentProfile { get; set; } = null!;
        public MedalType MedalType { get; set; }
        public DateTime EarnedAt { get; set; }
    }
}
