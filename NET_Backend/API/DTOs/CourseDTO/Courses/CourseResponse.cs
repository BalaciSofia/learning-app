using API.DTOs.CourseDTO.Units;

namespace API.DTOs.CourseDTO.Courses
{
    public record CourseResponse(
        int Id,
        string Title,
        string Description,
        string Subject,
        string Metadata,
        int InstitutionId,
        int CreatorId,
        bool IsPublished,
        List<UnitResponse> Units 
    );
}