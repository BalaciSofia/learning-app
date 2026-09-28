using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class TreasureRepository : ITreasureRepository
    {
        private readonly LearningAppDbContext _context;

        public TreasureRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Treasure?> GetByIdAsync(int treasureId)
        {
            return await _context.Treasures.FirstOrDefaultAsync(t => t.Id == treasureId);
        }
        
        public async Task<IEnumerable<Treasure>> GetAllTreasureForMapAsync(int mapId)
        {
            return await _context.Treasures
                .Where(t => t.MapId == mapId)
                .ToListAsync();
        }
        
    }
}
