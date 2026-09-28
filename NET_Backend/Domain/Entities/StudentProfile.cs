namespace Domain.Entities
{
    public class StudentProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int CourseId { get; set; }

        public int Xp { get; set; }
        public int Streak { get; set; }
        public DateOnly LastActivityDate { get; set; }

        
        public int QuestionsToday { get; set; }
        public int CorrectToday { get; set; }
        public int DailyQuestProgress { get; set; }
        public DateOnly DailyStatDate { get; set; }

        
        public int BattlesWon { get; set; }

        
        public DateOnly? DailyPuzzleClaimedDate { get; set; }

        public ICollection<UserMedal> Medals { get; set; } = new List<UserMedal>();
    }
}
