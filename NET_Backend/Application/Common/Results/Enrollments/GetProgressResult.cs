using System.Collections.Generic;
using Domain.Entities.Courses;

namespace Application.Common.Results.Enrollments
{
    public record GetProgressResult(
        GetProgressStatus Status,
        List<LessonProgress>? Lessons = null
    );
}
