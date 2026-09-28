using Application.Contracts;
using Domain.Entities.Courses;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CourseRepository:  ICourseRepository
{
    private readonly LearningAppDbContext _context;

    public CourseRepository(LearningAppDbContext context)
    {
        _context = context;
    }
    
    public async Task<Course> CreateCourseAsync(Course course)
    {
        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async Task<Course?> UpdateCourseAsync(Course course)
    {
        _context.Courses.Update(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async Task<Course?> DeleteCourseAsync(int courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course != null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Explicitly delete LessonProgresses to prevent NO ACTION constraint conflict on Lesson cascade delete
                await _context.LessonProgresses
                    .Where(lp => lp.Enrollment.CourseId == courseId)
                    .ExecuteDeleteAsync();

                // Explicitly delete StudentProfiles to avoid orphan records
                await _context.StudentProfiles
                    .Where(sp => sp.CourseId == courseId)
                    .ExecuteDeleteAsync();

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        
        return course;
    }

    public async Task<List<Course>> FilterCoursesByEnrolledStudentAsync(int studentId)
    {
        return await _context.Courses
            .Where(c => c.Enrollments.Any(e => e.UserId == studentId))
            .Include(c => c.Institution)
            .Include(c => c.Units)
            .ThenInclude(u => u.Lessons)
            .ToListAsync();
    }

    public async Task<List<Course>> FilterCoursesByInstitutionAsync(int institutionId, int currentUserId)
    {
        return await _context.Courses
            .Where(c => c.InstitutionId == institutionId && (c.IsPublished || c.CreatorId == currentUserId)) 
            .Include(c => c.Institution) 
            .Include(c => c.Units)
            .ThenInclude(u => u.Lessons)
            .ToListAsync();
    }

    public async Task<Course?> GetCourseByIdAsync(int id)
    {
        return await _context.Courses
            .Include(c => c.Units)
            .ThenInclude(u => u.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Course>> GetAllCoursesAsync()
    {
        return await _context.Courses
            .Include(c => c.Units)
            .ThenInclude(u => u.Lessons)
            .ToListAsync();
    }
}