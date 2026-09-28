using Application.Common.Results;
using Application.Contracts;
using Application.Helper;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.UseCases.StudyQuest
{
    public class StudentProfileService : IStudentProfileService
    {
        private readonly IStudentProfileRepository _profileRepo;
        private readonly IMapRepository _mapRepo;
        private readonly IQuestionRepository _questionRepo;
        private readonly IUserRepository _userRepo;

        public StudentProfileService(
            IStudentProfileRepository profileRepo,
            IMapRepository mapRepo,
            IQuestionRepository questionRepo,
            IUserRepository userRepo)
        {
            _profileRepo = profileRepo;
            _mapRepo = mapRepo;
            _questionRepo = questionRepo;
            _userRepo = userRepo;
        }

        public async Task<(StudentProfile Profile, User User)?> GetProfileAsync(int userId, int courseId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null) return null;

            var profile = await GetOrCreateAsync(userId, courseId);
            ResetDailyStatsIfNeeded(profile);
            await AwardNewMedalsAsync(profile);
            await _profileRepo.UpdateAsync(profile);

            return (profile, user);
        }

        public async Task<DailyPuzzleResult?> GetDailyPuzzleAsync(int userId, int courseId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var profile = await GetOrCreateAsync(userId, courseId);
            var question = await GetTodaysQuestionAsync(courseId, today);
            if (question is null) return null;

            var options = question.Answers.OrderBy(a => a.Id).Select(a => a.Text).ToList();

            return new DailyPuzzleResult(
                QuestionText:   question.Text,
                Options:        options,
                AlreadyClaimed: profile.DailyPuzzleClaimedDate == today
            );
        }

        public async Task<AnswerDailyPuzzleResult?> AnswerDailyPuzzleAsync(
            int userId, int courseId, int answerIndex)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null) return null;

            var profile = await GetOrCreateAsync(userId, courseId);
            ResetDailyStatsIfNeeded(profile);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (profile.DailyPuzzleClaimedDate == today)
                return new AnswerDailyPuzzleResult(AlreadyClaimed: true, Correct: false, XpAwarded: 0);

            var question = await GetTodaysQuestionAsync(courseId, today);
            if (question is null) return null;

            var answers = question.Answers.OrderBy(a => a.Id).ToList();
            var correct = answerIndex >= 0 && answerIndex < answers.Count && answers[answerIndex].IsCorrect;
            var xpAwarded = correct ? 50 : 0;

            profile.DailyPuzzleClaimedDate = today;
            if (correct)
                profile.Xp += xpAwarded;

            profile.Streak = StreakCalculator.Update(profile.Streak, profile.LastActivityDate, today);
            profile.LastActivityDate = today;

            await AwardNewMedalsAsync(profile);
            await _profileRepo.UpdateAsync(profile);

            return new AnswerDailyPuzzleResult(AlreadyClaimed: false, Correct: correct, XpAwarded: xpAwarded);
        }

        private async Task<Question?> GetTodaysQuestionAsync(int courseId, DateOnly today)
        {
            var map = await _mapRepo.GetByCourseIdAsync(courseId);
            if (map is null || map.Zones.Count == 0) return null;

            var questionIds = map.Zones.Select(z => z.QuestionId).ToList();
            int index = (today.DayNumber + courseId) % questionIds.Count;
            return await _questionRepo.GetQuestionByIdAsync(questionIds[index]);
        }

        public async Task<ShareProgressResult?> ShareProgressAsync(int userId, int courseId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null) return null;

            var profile = await GetOrCreateAsync(userId, courseId);
            ResetDailyStatsIfNeeded(profile);

            var level = LevelCalculator.ComputeLevel(profile.Xp);
            var rank  = LevelCalculator.ComputeRank(level);
            var name  = $"{user.FirstName} {user.LastName}".Trim();

            var text = $"{name} is a {rank} (Level {level}) with {profile.Xp} XP " +
                       $"and a {profile.Streak}-day streak!";

            return new ShareProgressResult(Text: text, Url: null);
        }

        private async Task<StudentProfile> GetOrCreateAsync(int userId, int courseId)
        {
            var profile = await _profileRepo.GetByUserIdAsync(userId, courseId);
            if (profile is not null)
                return profile;

            var newProfile = new StudentProfile { UserId = userId, CourseId = courseId };
            await _profileRepo.AddAsync(newProfile);
            return newProfile;
        }

        private static void ResetDailyStatsIfNeeded(StudentProfile profile)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (profile.DailyStatDate == today)
                return;

            profile.QuestionsToday    = 0;
            profile.CorrectToday      = 0;
            profile.DailyQuestProgress = 0;
            profile.DailyStatDate     = today;
        }

        private async Task AwardNewMedalsAsync(StudentProfile profile)
        {
            var newMedals = MedalEvaluator.GetNewlyEarned(profile);
            foreach (var medalType in newMedals)
            {
                profile.Medals.Add(new UserMedal
                {
                    MedalType = medalType,
                    EarnedAt  = DateTime.UtcNow
                });
            }
        }

    }
}
