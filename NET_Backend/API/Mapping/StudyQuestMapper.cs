using API.DTOs.StudyQuest;
using Application.Common.Results;
using Application.Helper;
using Domain.Entities;
using Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class StudyQuestMapper
    {
        public StudentProfileResponse ToResponse(StudentProfile profile, User user)
        {
            var level    = LevelCalculator.ComputeLevel(profile.Xp);
            var rank     = LevelCalculator.ComputeRank(level);
            var name     = $"{user.FirstName} {user.LastName}".Trim();
            var initials = string.Concat(
                user.FirstName?.Length > 0 ? user.FirstName[0].ToString() : string.Empty,
                user.LastName?.Length  > 0 ? user.LastName[0].ToString()  : string.Empty);

            return new StudentProfileResponse(
                Name:                   name,
                Initials:               initials,
                Xp:                     profile.Xp,
                Level:                  level,
                Rank:                   rank,
                Streak:                 profile.Streak,
                QuestionsToday:         profile.QuestionsToday,
                CorrectToday:           profile.CorrectToday,
                BattlesWon:             profile.BattlesWon,
                Medals:                 profile.Medals.Select(m => m.MedalType.ToString()).ToList(),
                DailyQuestProgress:     profile.DailyQuestProgress,
                DailyPuzzleClaimedDate: profile.DailyPuzzleClaimedDate
            );
        }

        public DailyPuzzleResponse ToResponse(DailyPuzzleResult result)
            => new(result.QuestionText, result.Options, result.AlreadyClaimed);

        public partial AnswerDailyPuzzleResponse ToResponse(AnswerDailyPuzzleResult result);
        public partial ShareProgressResponse ToResponse(ShareProgressResult result);
    }
}
