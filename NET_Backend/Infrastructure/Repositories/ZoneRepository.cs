using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ZoneRepository : IZoneRepository
    {
        private readonly LearningAppDbContext _context;

        public ZoneRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Zone?> GetByIdAsync(int zoneId)
        {
            return await _context.Zones.Include(q=>q.Question).FirstOrDefaultAsync(m => m.Id == zoneId);
        }
    }
}
