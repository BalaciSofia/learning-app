namespace Application.Helper.IHelper
{
    public interface IStreakCalculator
    {
        int Update(int currentStreak, DateOnly lastActivityDate, DateOnly today);
    }
}
