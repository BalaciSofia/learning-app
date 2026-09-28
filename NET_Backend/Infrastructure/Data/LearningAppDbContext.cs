using Domain.Entities;
using Domain.Entities.Courses;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class LearningAppDbContext : DbContext
    {
        public LearningAppDbContext(DbContextOptions<LearningAppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Test> Tests => Set<Test>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Answer> Answers => Set<Answer>();
        public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
        public DbSet<UserMedal> UserMedals => Set<UserMedal>();
        public DbSet<DailyPuzzle> DailyPuzzles => Set<DailyPuzzle>();
        
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Unit> Units => Set<Unit>();
        public DbSet<Lesson> Lessons => Set<Lesson>();
        public DbSet<Institution> Institutions => Set<Institution>();
        public DbSet<Enrollment> Enrollments => Set<Enrollment>();
        public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();

        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<Map> Maps => Set<Map>();
        public DbSet<Zone> Zones => Set<Zone>();
        public DbSet<Quest> Quests => Set<Quest>();
        public DbSet<Treasure> Treasures => Set<Treasure>();
        public DbSet<PlayerProgress> PlayerProgresses => Set<PlayerProgress>();

        public DbSet<TestAttempt> TestAttempts => Set<TestAttempt>();
        public DbSet<TestAttemptAnswer> TestAttemptAnswers => Set<TestAttemptAnswer>();

        public DbSet<DuelInvitation> DuelInvitations => Set<DuelInvitation>();
        public DbSet<DuelResult> DuelResults => Set<DuelResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(50);

            modelBuilder.Entity<Question>()
                .HasOne(q => q.Test)
                .WithMany(t => t.Questions)
                .HasForeignKey(q => q.TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Answer>()
                .HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PasswordResetToken>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PasswordResetToken>()
                .HasIndex(t => t.Token)
                .IsUnique();

            modelBuilder.Entity<PasswordResetToken>()
                .Property(t => t.Token)
                .HasMaxLength(256);

            modelBuilder.Entity<StudentProfile>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentProfile>()
                .HasIndex(p => new { p.UserId, p.CourseId })
                .IsUnique();

            modelBuilder.Entity<UserMedal>()
                .HasOne(m => m.StudentProfile)
                .WithMany(p => p.Medals)
                .HasForeignKey(m => m.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserMedal>()
                .Property(m => m.MedalType)
                .HasConversion<string>()
                .HasMaxLength(50);
            
            modelBuilder.Entity<Lesson>()
                .Property(l => l.Type)
                .HasConversion<string>()
                .HasMaxLength(50);
            
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Institution)
                .WithMany(i => i.Courses)
                .HasForeignKey(c => c.InstitutionId) // Fără string-uri!
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Creator)
                .WithMany()
                .HasForeignKey(c => c.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
    
            modelBuilder.Entity<Unit>()
                .HasOne(u => u.Course)
                .WithMany(c => c.Units)
                .HasForeignKey(u => u.CourseId) 
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Unit)       
                .WithMany(u => u.Lessons)      
                .HasForeignKey(l => l.UnitId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enrollment>()
                .HasIndex(e => new { e.UserId, e.CourseId })
                .IsUnique();

            modelBuilder.Entity<LessonProgress>()
                .HasOne(lp => lp.Enrollment)
                .WithMany(e => e.LessonProgresses)
                .HasForeignKey(lp => lp.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LessonProgress>()
                .HasOne(lp => lp.Lesson)
                .WithMany()
                .HasForeignKey(lp => lp.LessonId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<LessonProgress>()
                .HasIndex(lp => new { lp.EnrollmentId, lp.LessonId })
                .IsUnique();
            modelBuilder.Entity<TestAttempt>()
                .Property(ta => ta.Score)
                .HasPrecision(18, 4);

            modelBuilder.Entity<TestAttempt>()
                .Property(ta => ta.MaxScore)
                .HasPrecision(18, 4);

            modelBuilder.Entity<TestAttemptAnswer>()
                .Property(taa => taa.PointsAwarded)
                .HasPrecision(18, 4);

            modelBuilder.Entity<TestAttempt>()
                .HasOne(ta => ta.Test)
                .WithMany()
                .HasForeignKey(ta => ta.TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TestAttempt>()
                .HasOne(ta => ta.Student)
                .WithMany()
                .HasForeignKey(ta => ta.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TestAttemptAnswer>()
                .HasOne(taa => taa.TestAttempt)
                .WithMany(ta => ta.Answers)
                .HasForeignKey(taa => taa.TestAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TestAttemptAnswer>()
                .HasOne(taa => taa.Question)
                .WithMany()
                .HasForeignKey(taa => taa.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TestAttemptAnswer>()
                .HasOne(taa => taa.Answer)
                .WithMany()
                .HasForeignKey(taa => taa.AnswerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Zone>()
                .HasOne(z => z.Map)
                .WithMany(m => m.Zones)
                .HasForeignKey(z => z.MapId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Zone>()
                .HasOne(z => z.Question)
                .WithMany()
                .HasForeignKey(z => z.QuestionId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Quest>()
                .HasOne(q => q.Map)
                .WithMany(m => m.Quests)
                .HasForeignKey(q => q.MapId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Quest>()
                .HasOne(q => q.Question)
                .WithMany()
                .HasForeignKey(q => q.QuestionId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Treasure>()
                .HasOne(t => t.Map)
                .WithMany(m => m.Treasures)
                .HasForeignKey(t => t.MapId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlayerProgress>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlayerProgress>()
                .HasOne(p => p.Map)
                .WithMany()
                .HasForeignKey(p => p.MapId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlayerProgress>()
                .HasIndex(p => new { p.UserId, p.MapId })
                .IsUnique();

            modelBuilder.Entity<PlayerProgress>()
                .HasMany(p => p.ConqueredZones)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "PlayerProgressZone",
                    j => j.HasOne<Zone>().WithMany().OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<PlayerProgress>().WithMany().OnDelete(DeleteBehavior.NoAction));

            modelBuilder.Entity<PlayerProgress>()
                .HasMany(p => p.ClaimedQuests)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "PlayerProgressQuest",
                    j => j.HasOne<Quest>().WithMany().OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<PlayerProgress>().WithMany().OnDelete(DeleteBehavior.NoAction));

            modelBuilder.Entity<PlayerProgress>()
                .HasMany(p => p.ClaimedTreasures)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "PlayerProgressTreasure",
                    j => j.HasOne<Treasure>().WithMany().OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<PlayerProgress>().WithMany().OnDelete(DeleteBehavior.NoAction));

            modelBuilder.Entity<DuelInvitation>()
                .Property(d => d.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            modelBuilder.Entity<DuelInvitation>()
                .HasOne(d => d.Challenger)
                .WithMany()
                .HasForeignKey(d => d.ChallengerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DuelInvitation>()
                .HasOne(d => d.Challenged)
                .WithMany()
                .HasForeignKey(d => d.ChallengedId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DuelInvitation>()
                .HasOne(d => d.Test)
                .WithMany()
                .HasForeignKey(d => d.TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DuelResult>()
                .HasOne(r => r.DuelInvitation)
                .WithOne(d => d.Result)
                .HasForeignKey<DuelResult>(r => r.DuelInvitationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DuelResult>()
                .HasOne(r => r.Winner)
                .WithMany()
                .HasForeignKey(r => r.WinnerId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        }
    }
}
