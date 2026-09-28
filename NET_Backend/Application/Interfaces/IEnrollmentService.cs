using Application.Common.Results.Enrollments;
using Domain.Entities;
using Domain.Entities.Courses;

namespace Application.Interfaces
{
    public interface IEnrollmentService
    {
        Task<EnrollResult> GetEnrollmentAsync(User user, Course course);
        Task<EnrollResult> EnrollStudentAsync(User user, Course course);
        Task<GetProgressResult> GetProgressAsync(Enrollment enrollment, Course course);
        Task<CompleteLessonResult> CompleteLessonAsync(Enrollment enrollment, Lesson lesson);
    }
}
