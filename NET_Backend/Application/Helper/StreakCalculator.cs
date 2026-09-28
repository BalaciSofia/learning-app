namespace Application.Helper
{
    public static class StreakCalculator
    {
        public static int Update(int currentStreak, DateOnly lastActivityDate, DateOnly today)
        {
            if (lastActivityDate == default)
                return 1;

            if (lastActivityDate == today)
                return currentStreak;

            if (lastActivityDate.AddDays(1) == today)
                return currentStreak + 1;

            return 1;
        }
    }
}
