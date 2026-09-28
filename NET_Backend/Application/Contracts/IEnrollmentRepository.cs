using Domain.Entities.Courses;

namespace Application.Contracts
{
    public interface IEnrollmentRepository
    {
        Task<Enrollment?> GetByUserAndCourseAsync(int userId, int courseId);
        Task AddAsync(Enrollment enrollment);
        Task<Enrollment?> GetWithProgressByIdAsync(int enrollmentId);
        Task<Enrollment?> GetWithProgressAsync(int userId, int courseId);
        Task AddLessonProgressAsync(LessonProgress progress);
        Task UpdateLessonProgressAsync(LessonProgress progress);
        Task<LessonProgress?> GetLessonProgressAsync(int enrollmentId, int lessonId);
        Task<int> CountCompletedLessonsAsync(int enrollmentId);
    }
}
