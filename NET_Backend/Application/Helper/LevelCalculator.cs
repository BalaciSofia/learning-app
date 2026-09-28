namespace Application.Helper
{
    public static class LevelCalculator
    {
        public static int ComputeLevel(int xp) =>
            xp <= 0 ? 1 : (xp / 100) + 1;

        public static string ComputeRank(int level) => level switch
        {
            <= 3 => "Novice",
            <= 7 => "Apprentice",
            <= 12 => "Scholar",
            <= 20 => "Expert",
            _ => "Grandmaster"
        };
    }
}
