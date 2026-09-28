using Domain.Entities;
using Domain.Enums;

namespace Application.Helper
{
    public static class MedalEvaluator
    {
        public static IReadOnlyList<MedalType> GetNewlyEarned(StudentProfile profile)
        {
            var existing = profile.Medals.Select(m => m.MedalType).ToHashSet();
            var earned = new List<MedalType>();

            Check(MedalType.FirstQuestion, profile.QuestionsToday >= 1);
            Check(MedalType.Streak3,       profile.Streak >= 3);
            Check(MedalType.Streak7,       profile.Streak >= 7);
            Check(MedalType.Streak30,      profile.Streak >= 30);
            Check(MedalType.BattlesWon5,   profile.BattlesWon >= 5);
            Check(MedalType.BattlesWon25,  profile.BattlesWon >= 25);
            Check(MedalType.Level5,        LevelCalculator.ComputeLevel(profile.Xp) >= 5);
            Check(MedalType.Level10,       LevelCalculator.ComputeLevel(profile.Xp) >= 10);

            return earned;

            void Check(MedalType type, bool eligible)
            {
                if (eligible && !existing.Contains(type))
                    earned.Add(type);
            }
        }
    }
}
