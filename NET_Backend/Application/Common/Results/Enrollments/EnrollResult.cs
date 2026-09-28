using Domain.Entities.Courses;

namespace Application.Common.Results.Enrollments
{
    public record EnrollResult(
        EnrollStatus Status,
        Enrollment? Enrollment = null
    );
}
