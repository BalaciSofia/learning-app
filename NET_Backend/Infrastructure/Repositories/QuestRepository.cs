using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class QuestRepository : IQuestRepository
    {
        private readonly LearningAppDbContext _context;

        public QuestRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Quest?> GetByIdAsync(int questId)
        {
            return await _context.Quests
                .Include(q => q.Question)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == questId);
        }

        public async Task<IEnumerable<Quest>> GetAllQuestsForMapAsync(int mapId)
        {
            return await _context.Quests.Where(q => q.MapId == mapId).ToListAsync();
        }
    }
}
