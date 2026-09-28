using API.DTOs.CourseDTO.Lessons;

namespace API.DTOs.CourseDTO.Units
{

    public record UnitResponse(
        int Id,
        string Title,
        string Description,
        List<LessonResponse> Lessons
    );
}