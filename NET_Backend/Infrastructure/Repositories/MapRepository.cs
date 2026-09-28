using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class MapRepository : IMapRepository
    {
        private readonly LearningAppDbContext _context;

        public MapRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Map?> GetByCourseIdAsync(int courseId)
        {
            return await _context.Maps
                .Include(m => m.Zones)
                .ThenInclude(z => z.Question)
                .ThenInclude(q => q.Answers)
                .Include(m => m.Quests)
                .ThenInclude(q => q.Question)
                .ThenInclude(qe => qe.Answers)
                .Include(m => m.Treasures)
                .FirstOrDefaultAsync(m => m.CourseId == courseId);
        }
    }
}
