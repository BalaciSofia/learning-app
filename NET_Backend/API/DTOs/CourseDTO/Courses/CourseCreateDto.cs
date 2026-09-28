namespace API.DTOs.CourseDTO.Courses
{
    public record CourseCreateDto(
        string Title,
        string Description,
        string Subject,
        string Metadata
    );
}