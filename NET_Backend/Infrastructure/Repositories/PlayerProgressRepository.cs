using Application.Contracts;
using Domain.Entities;
using Domain.Entities.Courses;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class PlayerProgressRepository : IPlayerProgressRepository
    {
        private readonly LearningAppDbContext _context;

        public PlayerProgressRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(PlayerProgress progress)
        {
            await _context.PlayerProgresses.AddAsync(progress);
        }

        public async Task<PlayerProgress?> GetByUserAndMapAsync(int userId, Map map)
        {
            return await _context.PlayerProgresses
                .Include(p => p.ConqueredZones)
                .Include(p => p.ClaimedQuests)
                .Include(p => p.ClaimedTreasures)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.MapId == map.Id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PlayerProgress progress)
        {
            _context.PlayerProgresses.Update(progress);
        }

        public async Task<PlayerProgress> CreateAsync(PlayerProgress progress)
        {
            _context.PlayerProgresses.Add(progress);
            await _context.SaveChangesAsync();
            return progress;
        }

        public async Task<int> AddZoneToConquestAsync(PlayerProgress progress, Zone zone, int newXp)
        {
            progress.ConqueredZones.Add(zone);
            progress.TotalXp += newXp;
            progress.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return progress.TotalXp;
        }
    }
}
