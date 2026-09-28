using API.DTOs.CourseDTO.Enrollment;
using Application.Common.Results.Enrollments;
using Domain.Entities.Courses;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class EnrollmentMapper
    {
        public partial EnrollmentResponse ToResponse(Enrollment enrollment);
        
        public partial LessonProgressResponse ToResponse(LessonProgress lessonProgress);

        public partial ProgressSummaryResponse ToResponse(CompleteLessonResult result);
    }
}
