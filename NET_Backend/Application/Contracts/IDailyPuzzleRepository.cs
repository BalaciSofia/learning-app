using Domain.Entities;

namespace Application.Contracts
{
    public interface IDailyPuzzleRepository
    {
        Task<DailyPuzzle?> GetTodaysPuzzleAsync(int courseId, DateOnly today);
    }
}
