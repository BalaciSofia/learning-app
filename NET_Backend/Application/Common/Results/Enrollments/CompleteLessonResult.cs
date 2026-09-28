using System.Collections.Generic;
using Domain.Entities.Courses;

namespace Application.Common.Results.Enrollments
{
    public record CompleteLessonResult(
        CompleteLessonStatus Status,
        double ProgressPercent = 0,
        List<LessonProgress>? Lessons = null
    );
}
