using Application.Contracts;
using Domain.Entities.Courses;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UnitRepository : IUnitRepository
{
    private readonly LearningAppDbContext _context;

    public UnitRepository(LearningAppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> CreateAsync(Unit unit)
    {
        _context.Units.Add(unit);
        await _context.SaveChangesAsync();
        return unit;
    }

    public async Task<Unit?> GetByIdAsync(int id)
    {
        return await _context.Units
            .Include(u => u.Lessons) 
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task UpdateAsync(Unit unit)
    {
        _context.Units.Update(unit);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Unit unit)
    {
        _context.Units.Remove(unit);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Unit>> GetUnitsByCourseIdAsync(int courseId)
    {
        return await _context.Units
            .Where(u => u.CourseId == courseId)
            .ToListAsync();
    }
}