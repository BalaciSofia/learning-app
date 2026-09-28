namespace API.DTOs.CourseDTO.Courses
{

    public record CourseUpdateDto(
        string Title,
        string Description,
        string Subject,
        string Metadata
    );
}