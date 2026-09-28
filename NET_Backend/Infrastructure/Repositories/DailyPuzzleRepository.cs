using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class DailyPuzzleRepository : IDailyPuzzleRepository
    {
        private readonly LearningAppDbContext _db;

        public DailyPuzzleRepository(LearningAppDbContext db) => _db = db;

        public Task<DailyPuzzle?> GetTodaysPuzzleAsync(int courseId, DateOnly today) =>
            _db.DailyPuzzles
               .FirstOrDefaultAsync(p => p.PuzzleDate == today && p.CourseId == courseId);
    }
}
