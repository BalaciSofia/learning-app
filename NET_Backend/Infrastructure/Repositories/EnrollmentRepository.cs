using Application.Contracts;
using Domain.Entities.Courses;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly LearningAppDbContext _context;

        public EnrollmentRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Enrollment?> GetByUserAndCourseAsync(int userId, int courseId)
        {
            return await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        }

        public async Task AddAsync(Enrollment enrollment)
        {
            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();
        }

        public async Task<Enrollment?> GetWithProgressByIdAsync(int enrollmentId)
        {
            return await _context.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);
        }

        public async Task<Enrollment?> GetWithProgressAsync(int userId, int courseId)
        {
            return await _context.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        }

        public async Task AddLessonProgressAsync(LessonProgress progress)
        {
            _context.LessonProgresses.Add(progress);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateLessonProgressAsync(LessonProgress progress)
        {
            _context.LessonProgresses.Update(progress);
            await _context.SaveChangesAsync();
        }

        public async Task<LessonProgress?> GetLessonProgressAsync(int enrollmentId, int lessonId)
        {
            return await _context.LessonProgresses
                .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollmentId && lp.LessonId == lessonId);
        }

        public async Task<int> CountCompletedLessonsAsync(int enrollmentId)
        {
            return await _context.LessonProgresses
                .CountAsync(lp => lp.EnrollmentId == enrollmentId && lp.Completed);
        }
    }
}
