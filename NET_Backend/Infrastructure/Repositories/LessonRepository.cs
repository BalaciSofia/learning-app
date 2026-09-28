using Application.Contracts;
using Domain.Entities.Courses;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly LearningAppDbContext _context;

    public LessonRepository(LearningAppDbContext context)
    {
        _context = context;
    }

    public async Task<Lesson> CreateAsync(Lesson lesson)
    {
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();
        return lesson;
    }

    public async Task<Lesson?> GetByIdAsync(int id)
    {
        return await _context.Lessons.FindAsync(id);
    }

    public async Task UpdateAsync(Lesson lesson)
    {
        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Lesson lesson)
    {
        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.LessonId == lesson.Id)
            .ToListAsync();

        if (lessonProgresses.Any())
        {
            _context.LessonProgresses.RemoveRange(lessonProgresses);
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Lesson>> GetLessonsByUnitIdAsync(int unitId)
    {
        return await _context.Lessons
            .Where(l => EF.Property<int>(l, "UnitId") == unitId)
            .ToListAsync();
    }
}